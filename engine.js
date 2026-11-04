// =====================================================================
//  ORTANOKTA MACERASI · OYUN MOTORU
//  Deterministik: iki cihaz aynı durum + aynı oylarla aynı sonucu üretir.
// =====================================================================
const GAME_V = 3;

function rngFor(seed, step){
  let a = (seed ^ Math.imul(step + 1, 2654435761)) >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const d6 = r => 1 + Math.floor(r() * 6);
const clone = o => JSON.parse(JSON.stringify(o));

function ctxOf(P){
  return { has:i => P.inv.includes(i), n:k => P.npc[k] || 0, f:k => !!P.flags[k], from:P.from || null, P };
}
const val = (v, c) => typeof v === 'function' ? v(c) : v;
const checkOf = (ch, c) => ch.check ? val(ch.check, c) : null;
const isOpen = (ch, c) => !ch.req || !!ch.req(c);

// Bir yetenek kontrolünü geçme olasılığı (toplam güç + 1d6 >= zorluk)
function passChance(power, dc){ const need = dc - power; return Math.max(0, Math.min(1, (7 - need) / 6)); }

function isGame(d){
  return !!(d && d.v === GAME_V && typeof d.step === 'number' && (S[d.scene] || d.scene === 'end')
    && d.stats && d.stats.irem && d.stats.cengiz && Array.isArray(d.inv) && Array.isArray(d.log));
}

function applyFx(N, fx, out){
  if (!fx) return;
  (fx.inv || []).forEach(x => {
    const id = x.slice(1), it = ITEMS[id];
    if (x[0] === '+' && !N.inv.includes(id)){ N.inv.push(id); out.push({k:'item', t:`${it.e} ${it.n}`, plus:true}); }
    if (x[0] === '-' && N.inv.includes(id)){ N.inv = N.inv.filter(y => y !== id); out.push({k:'item', t:`${it.e} ${it.n}`, plus:false}); }
  });
  Object.entries(fx.npc || {}).forEach(([k, v]) => {
    const before = N.npc[k] || 0, after = Math.max(-3, Math.min(5, before + v));
    N.npc[k] = after;
    if (after !== before) out.push({k:'npc', t:`${NPCS[k].e} ${NPCS[k].n}`, v:after - before});
  });
  Object.entries(fx.flag || {}).forEach(([k, v]) => { N.flags[k] = v; });
  if (fx.uyum){ N.uyum += fx.uyum; out.push({k:'uyum', t:'💞 Uyum', v:fx.uyum}); }
  if (fx.kaos){ N.kaos += fx.kaos; out.push({k:'kaos', t:'🌪️ Kaos', v:fx.kaos}); }
  if (fx.visit){ N.visits = (N.visits || 0) + fx.visit; }
}

// Mini oyun soruları (deterministik, aynı oyunda tekrar etmez)
function makeMq(N){
  const sc = S[N.scene], r = rngFor(N.seed ^ 0x5bd1e995, N.step);
  N.qUsed = N.qUsed || [];
  const qs = sc.mini.qs.map(([kind, sub]) => {
    const pool = QB[kind].filter(q => !N.qUsed.includes(q.id));
    const list = pool.length ? pool : QB[kind];
    const q = list[Math.floor(r() * list.length)];
    N.qUsed.push(q.id);
    return {kind, id:q.id, sub:sub || null};
  });
  N.mq = {step:N.step, k:0, qs, res:[]};
}
function ansRange(P){ const q = P.mq.qs[P.mq.k]; return q.kind === 'kim' ? 2 : QBY[q.id].o.length; }
function validAnsFor(P, t){ return !!(t && P.mq && t.step === P.step && t.k === P.mq.k && Number.isInteger(t.a) && t.a >= 0 && t.a < ansRange(P)); }

// Bir sahneden diğerine geçiş: son kontrolü, giriş etkileri, mini oyun hazırlığı
function transition(N, go, fx){
  if (go.startsWith('END:')){ N.scene = 'end'; N.ending = go.slice(4); }
  else if (go === 'end'){ N.scene = 'end'; N.ending = evalEnding(N); }
  else {
    N.scene = go;
    if (S[go].onEnter) applyFx(N, val(S[go].onEnter, ctxOf(N)), fx);
    if (S[go].mini) makeMq(N);
  }
  if (N.ending && !N.found.includes(N.ending)) N.found.push(N.ending);
}

// Mini oyunda bir soruyu cevapla. Son soruysa sahneyi çözer.
function mqAdvance(P, ai, ac){
  const N = clone(P);
  N.mq.res.push({i:ai, c:ac, m:ai === ac});
  N.mq.k++;
  if (N.mq.k < N.mq.qs.length) return N;
  return resolveMini(N);
}
function resolveMini(P){
  const sc = S[P.scene], c = ctxOf(P);
  const N = clone(P);
  N.step = P.step + 1; N.from = P.scene; N.dis = null;
  const res = P.mq.res, total = res.length, matches = res.filter(x => x.m).length;
  N.mqMatch = (N.mqMatch || 0) + matches; N.mqTotal = (N.mqTotal || 0) + total;
  const fx = [];
  const rw = sc.mini.reward(matches, total, c);
  applyFx(N, rw.fx, fx);
  N.log.push({scene:P.scene, mini:true, mm:matches, mt:total});
  N.mq = null;
  transition(N, val(sc.go, ctxOf(N)), fx);
  N.last = {kind:'mini', scene:P.scene, step:P.step, art:val(sc.art, c), title:sc.title, qs:P.mq.qs, res, matches, total, text:rw.text, fx, next:N.scene};
  return N;
}

function newGame(prev){
  const seed = Math.floor(Math.random() * 2147483647);
  const keys = Object.keys(MISSIONS);
  const a = keys[Math.floor(Math.random() * keys.length)];
  let b; do { b = keys[Math.floor(Math.random() * keys.length)]; } while (b === a);
  return {
    v:GAME_V, step:((prev && typeof prev.step === 'number') ? prev.step : 0) + 1, seed, scene:'karakter', from:null,
    stats:{irem:{ce:1, ck:1, ze:1, sa:1}, cengiz:{ce:1, ck:1, ze:1, sa:1}},
    inv:[], npc:{}, flags:{}, uyum:0, kaos:0, wins:{irem:0, cengiz:0},
    missions:{irem:a, cengiz:b}, last:null, log:[], ending:null, dis:null, ikna:0,
    mq:null, mqMatch:0, mqTotal:0, visits:0, qUsed:[],
    found:(prev && Array.isArray(prev.found)) ? prev.found.filter(k => ENDINGS[k]) : []
  };
}

function pickFunny(c, r){ const pool = FUNNY.filter(f => !f.c || f.c(c)); return pool[Math.floor(r() * pool.length)].t; }

// Taş-kağıt-makas: 1 = İrem kazanır, -1 = Cengiz, 0 = berabere
const BEATS = {tas:'makas', makas:'kagit', kagit:'tas'};
function rpsOutcome(a, b){ return a === b ? 0 : BEATS[a] === b ? 1 : -1; }
const validThrow = h => h === 'katil' || !!HANDS[h];

// Anlaşmazlık turunu ilerlet. {state:N} (yeni tur) ya da {resolve:dis} döner.
function disAdvance(P, ti, tc){
  const d = P.dis, hist = d.hist.concat([{i:ti, c:tc}]);
  if (ti === 'katil' || tc === 'katil'){
    let by;
    if (ti === 'katil' && tc === 'katil') by = rngFor(P.seed, P.step * 31 + d.round)() < .5 ? 'irem' : 'cengiz';
    else by = ti === 'katil' ? 'irem' : 'cengiz';
    return {resolve:{mode:'concede', by, hist, both:ti === 'katil' && tc === 'katil'}};
  }
  const o = rpsOutcome(ti, tc);
  if (o === 0){
    if (d.round < RPS_ROUNDS){ const N = clone(P); N.dis = Object.assign({}, d, {round:d.round + 1, hist}); return {state:N}; }
    return {resolve:{mode:'dice', hist}};
  }
  return {resolve:{mode:'rps', w:o > 0 ? 'irem' : 'cengiz', hist}};
}
function openDis(P, vi, vc){ const N = clone(P); N.dis = {step:P.step, round:1, hist:[], i:vi, c:vc}; return N; }

// İki oyla bir hamleyi çöz. Saf fonksiyon. dis: anlaşmazlığın nasıl çözüldüğü.
function resolve(P, vi, vc, dis){
  const sc = S[P.scene], r = rngFor(P.seed, P.step), c = ctxOf(P);
  const N = clone(P);
  N.step = P.step + 1;
  N.from = P.scene;
  N.dis = null;
  const fx = [];
  const last = {scene:P.scene, step:P.step, i:vi, c:vc, agree:vi === vc, art:val(sc.art, c), title:sc.title};
  let go;

  if (sc.individual){
    last.kind = 'ind';
    PL.forEach((p, k) => {
      const st = sc.choices[k ? vc : vi].st;
      N.stats[p][st] += 2;
      fx.push({k:'stat', t:`${NAMES[p]} · ${STATS[st][0]} ${STATS[st][1]}`, v:2});
    });
    if (vi === vc){ N.uyum++; fx.unshift({k:'uyum', t:'💞 Uyum', v:1}); }
    go = sc.go;
  } else {
    let applied, appliers;
    if (vi === vc){
      applied = vi; appliers = PL.slice(); N.uyum++;
      fx.push({k:'uyum', t:'💞 Uyum', v:1});
    } else if (dis && dis.mode === 'concede'){
      applied = dis.by === 'irem' ? vc : vi; appliers = PL.slice();
      N.ikna = (N.ikna || 0) + 1;
      fx.push({k:'ikna', t:`🤝 ${NAMES[dis.by]} ikna oldu`});
      last.concede = {by:dis.by, both:!!dis.both, hist:dis.hist || []};
    } else if (dis && dis.mode === 'rps'){
      const w = dis.w;
      applied = w === 'irem' ? vi : vc; appliers = [w];
      N.kaos++; N.wins[w]++;
      fx.push({k:'kaos', t:'🌪️ Kaos', v:1});
      last.rps = {hist:dis.hist, w, line:pickFunny(c, r)};
    } else {
      const ci = sc.choices[vi], cc = sc.choices[vc];
      const ri = d6(r), rc = d6(r);
      const si = P.stats.irem[ci.st], sC = P.stats.cengiz[cc.st];
      let w, tie = false;
      if (si + ri > sC + rc) w = 'irem';
      else if (sC + rc > si + ri) w = 'cengiz';
      else { tie = true; w = P.stats.irem.sa !== P.stats.cengiz.sa ? (P.stats.irem.sa > P.stats.cengiz.sa ? 'irem' : 'cengiz') : (r() < .5 ? 'irem' : 'cengiz'); }
      applied = w === 'irem' ? vi : vc; appliers = [w];
      N.kaos++; N.wins[w]++;
      fx.push({k:'kaos', t:'🌪️ Kaos', v:1});
      last.duel = {ri, rc, si, sC, sti:ci.st, stc:cc.st, w, tie, line:pickFunny(c, r), hist:(dis && dis.hist) || []};
    }
    const ch = sc.choices[applied];
    last.a = applied;
    let ok = true;
    const chk = checkOf(ch, c);
    if (chk){
      const base = appliers.reduce((s, p) => s + P.stats[p][ch.st], 0);
      const roll = d6(r), total = base + roll;
      ok = total >= chk.dc;
      last.check = {st:ch.st, base, roll, total, dc:chk.dc, ok, team:appliers.length === 2, who:appliers.length === 1 ? appliers[0] : null};
    }
    last.text = val(ok ? ch.ok : (ch.fail || ch.ok), c);
    applyFx(N, val(ok ? ch.fx : ch.fxF, c), fx);
    appliers.forEach(p => {
      if (N.stats[p][ch.st] < 8){ N.stats[p][ch.st]++; fx.push({k:'stat', t:`${NAMES[p]} · ${STATS[ch.st][0]} ${STATS[ch.st][1]}`, v:1}); }
    });
    go = ok ? ch.go : (ch.goF || ch.go);
  }

  N.log.push({scene:P.scene, i:vi, c:vc, a:last.a === undefined ? null : last.a, ok:last.check ? last.check.ok : null,
    m:last.concede ? 'ikna' : last.rps ? 'rps' : last.duel ? 'zar' : null, by:last.concede ? last.concede.by : null});
  transition(N, val(go, ctxOf(N)), fx);
  last.fx = fx;
  last.next = N.scene;
  N.last = last;
  return N;
}
