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

// Mini oyun soruları (deterministik, aynı oyunda tekrar etmez).
// Soru metni duruma gömülür; böylece iki cihaz da aynı soruyu görür.
const CIZ_WORDS = ['Keçi','Balon','Turşu','Kedi','Pasta','Otobüs','Kalp','Güneş','Ev','Ağaç','Fener','Taksi','Kaktüs','Mantı','Yıldız','Değirmen','Dürbün','Gözlük','Şemsiye','Kupa','Anahtar','Balık','Dondurma','Bisiklet','Çiçek','Ay','Bulut','Telefon','Gemi','Pizza'];
function makeMq(N){
  const sc = S[N.scene], r = rngFor(N.seed ^ 0x5bd1e995, N.step);
  N.qUsed = N.qUsed || [];
  const hist = Array.isArray(N.qHist) ? N.qHist : [];
  const cq = Array.isArray(N.cq) ? N.cq : [];
  const th = sc.mini.th || null;
  const pick = list => list[Math.floor(r() * list.length)];
  // önce bu oyunda ve önceki oyunlarda hiç çıkmamışlar, sahneye uygunsa onlar öne
  const choose = (list, idOf) => {
    idOf = idOf || (q => q.id);
    const fresh = list.filter(q => !N.qUsed.includes(idOf(q)) && !hist.includes(idOf(q)));
    const unusedNow = list.filter(q => !N.qUsed.includes(idOf(q)));
    const base = fresh.length ? fresh : unusedNow.length ? unusedNow : list;
    const themed = th ? base.filter(q => q.th === th) : [];
    const q = themed.length && r() < 0.65 ? pick(themed) : pick(base);
    N.qUsed.push(idOf(q));
    return q;
  };
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wordQ = (kind, sub, words, pre) => {
    const w = choose(words.map(x => ({id:pre + x, w:x}))).w;
    const o = [w], others = words.filter(x => x !== w);
    while (o.length < 4){ const x = pick(others); if (!o.includes(x)) o.push(x); }
    shuffle(o);
    return {kind, id:pre + w, sub, t:w, o, c:o.indexOf(w)};
  };
  const make = (kind, sub) => {
    if (kind === 'refleks') return {kind, id:'refleks', sub:null, t:'Profesör belirince ekrana dokun!'};
    if (kind === 'senkron'){ const target = 5 + Math.floor(r() * 5); return {kind, id:'senkron', sub:null, t:`${target} saniyeyi hisset!`, target:target * 1000}; }
    if (kind === 'ciz') return wordQ(kind, sub, CIZ_WORDS, 'ciz:');
    if (kind === 'emoji') return wordQ(kind, sub, EMOJI_WORDS, 'emo:');
    if (kind === 'bumu'){
      const pairs = []; for (let i = 0; i < 6; i++) pairs.push(choose(BUMU).p);
      return {kind, id:'bumu', sub:null, t:'Bu mu, şu mu?', pairs};
    }
    if (kind === 'sirala'){ const q = choose(SIRALA); return {kind, id:q.id, sub, t:q.t, g:q.g, items:q.items.slice()}; }
    if (kind === 'serbest'){ const q = choose(SERBEST); return {kind, id:q.id, sub, t:q.t, g:q.g}; }
    if (kind === 'hafiza'){
      const seen = new Set();
      const cands = (N.log || []).filter(e => {
        const s0 = S[e.scene];
        if (!s0 || s0.mini || s0.individual || s0.event || e.a === null || e.a === undefined || !s0.choices || s0.choices.length < 2) return false;
        if (seen.has(e.scene) || N.qUsed.includes('haf:' + e.scene)) return false;
        seen.add(e.scene); return true;
      });
      if (cands.length){
        const e = pick(cands), s0 = S[e.scene]; N.qUsed.push('haf:' + e.scene);
        const others = shuffle(s0.choices.map((_, i) => i).filter(i => i !== e.a)).slice(0, 3);
        const idx = shuffle([e.a].concat(others));
        return {kind, id:'haf:' + e.scene, sub:null, t:`"${s0.title}" sahnesinde ne yapmıştınız?`, o:idx.map(i => s0.choices[i].t), c:idx.indexOf(e.a)};
      }
      kind = 'ayni';
    }
    const mine = cq.filter(q => q.kind === kind && (kind !== 'tahmin' || q.by === sub) && !N.qUsed.includes(q.id));
    if (mine.length && r() < 0.5){
      const q = pick(mine); N.qUsed.push(q.id);
      return {kind, id:q.id, sub:sub || null, t:q.t, g:null, o:kind === 'kim' ? null : q.o.slice(0, 4), custom:true, by:q.by};
    }
    const q = choose(QB[kind]);
    return {kind, id:q.id, sub:sub || null, t:q.t, g:q.g || null, o:q.o ? q.o.slice() : null};
  };
  const qs = sc.mini.qs.map(([kind, sub]) => make(kind, sub));
  N.mq = {step:N.step, k:0, qs, res:[]};
}
function qOpts(q){ if (q.kind === 'kim') return KIM_OPTS; if (q.o) return q.o; const Q = QBY[q.id]; return Q && Q.o ? Q.o : []; }
function ansRange(P){
  const q = P.mq.qs[P.mq.k];
  switch (q.kind){
    case 'refleks': return 5001;
    case 'senkron': return 30001;
    case 'bumu': return 64;
    case 'sirala': return 24;
    case 'serbest': return 3;
    default: return qOpts(q).length;
  }
}
function validAnsFor(P, t){ return !!(t && P.mq && t.step === P.step && t.k === P.mq.k && Number.isInteger(t.a) && t.a >= 0 && t.a < ansRange(P)); }
// Refleks: ikiniz de hızlıysanız (ortalama < 650 ms, ikisi de < 1000 ms) eşleşme sayılır
function refleksOk(a, b){ return (a + b) / 2 < 650 && a < 1000 && b < 1000; }
const bitsSame = (a, b, n) => { let k = 0; for (let i = 0; i < n; i++) if (((a >> i) & 1) === ((b >> i) & 1)) k++; return k; };
const permHits = (a, b) => { const x = PERMS4[a] || [], y = PERMS4[b] || []; let k = 0; for (let i = 0; i < 4; i++) if (x[i] === y[i]) k++; return k; };
const SENKRON_TOL = 600;
// bir sorunun puanı: {m: eşleşme, s: ayrıntı}
function mqScore(q, ai, ac){
  switch (q.kind){
    case 'refleks': return {m:refleksOk(ai, ac)};
    case 'senkron': { const d = Math.abs(ai - ac); return {m:d <= SENKRON_TOL, s:d}; }
    case 'bumu': { const k = bitsSame(ai, ac, q.pairs.length); return {m:k >= 4, s:k}; }
    case 'sirala': { const k = permHits(ai, ac); return {m:k >= 2, s:k}; }
    case 'serbest': { const j = q.sub === 'irem' ? ai : ac; return {m:j >= 1, s:j}; }
    case 'hafiza': return {m:ai === q.c && ac === q.c, s:(ai === q.c ? 1 : 0) + (ac === q.c ? 1 : 0)};
    default: return {m:ai === ac};
  }
}
// bir sorunun ilerleyebilmesi için iki cevabın da hazır olması (serbestte hakem kararı da gerekir)
function mqReady(P, A, B){
  const q = P.mq.qs[P.mq.k];
  if (!validAnsFor(P, A) || !validAnsFor(P, B)) return false;
  if (q.kind === 'serbest'){ const J = q.sub === 'irem' ? A : B; return J.jd === true; }
  return true;
}
function chOf(id, P){ const s = S[id]; if (!s) return null; if (s.ch !== null && s.ch !== undefined) return s.ch; return (P && P.evtRet && S[P.evtRet]) ? S[P.evtRet].ch : 1; }

// Bir sahneden diğerine geçiş: son kontrolü, giriş etkileri, mini oyun hazırlığı
function transition(N, go, fx){
  if (tryEvent(N, go)) return;
  if (go.startsWith('END:')){ N.scene = 'end'; N.ending = go.slice(4); }
  else if (go === 'end'){ N.scene = 'end'; N.ending = evalEnding(N); }
  else {
    N.scene = go;
    if (S[go].onEnter) applyFx(N, val(S[go].onEnter, ctxOf(N)), fx);
    if (S[go].mini) makeMq(N);
  }
  if (N.ending && !N.found.includes(N.ending)) N.found.push(N.ending);
}

// Rastgele olay: aynı bölüm içindeki geçişlerde araya girer
function tryEvent(N, go){
  if (typeof EVENT_IDS === 'undefined' || go.startsWith('END:') || go === 'end') return false;
  const to = S[go], from = S[N.from];
  if (!to || !from || to.mini || to.event || from.event || from.individual) return false;
  if (to.ch !== from.ch || !EVENT_CHAPTERS.includes(to.ch) || (N.evtCount || 0) >= EVENT_MAX) return false;
  const r = rngFor(N.seed ^ 0x2c1b3c6d, N.step);
  if (r() >= EVENT_P) return false;
  const c = ctxOf(N);
  const pool = EVENT_IDS.filter(id => !(N.evtUsed || []).includes(id) && S[id].cond(c));
  if (!pool.length) return false;
  const id = pool[Math.floor(r() * pool.length)];
  N.evtUsed = (N.evtUsed || []).concat(id); N.evtCount = (N.evtCount || 0) + 1; N.evtRet = go; N.scene = id;
  return true;
}

// Mini oyunda bir soruyu cevapla. Son soruysa sahneyi çözer.
function mqAdvance(P, ai, ac, extra){
  const N = clone(P);
  const q = N.mq.qs[N.mq.k];
  const sc0 = mqScore(q, ai, ac), rec = {i:ai, c:ac, m:sc0.m};
  if (sc0.s !== undefined) rec.s = sc0.s;
  if (extra && typeof extra.d === 'string') rec.d = extra.d;
  if (extra && typeof extra.e === 'string') rec.e = extra.e.slice(0, 40);
  if (extra && typeof extra.xi === 'string') rec.xi = extra.xi.slice(0, 80);
  if (extra && typeof extra.xc === 'string') rec.xc = extra.xc.slice(0, 80);
  // oyun sonu "en şaşırtan cevap" için tutmayanları sakla
  if (!rec.m && ['tahmin','kim','ayni','sirala','serbest','hafiza'].includes(q.kind)){
    N.mqMiss = (N.mqMiss || []).concat([{q:{kind:q.kind, sub:q.sub, t:q.t, g:q.g || null, o:q.o || null, id:q.id, items:q.items || null}, r:rec}]).slice(-12);
  }
  N.mq.res.push(rec);
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
  if (matches === total) earnJokers(N, fx, 'mini');
  N.log.push({scene:P.scene, mini:true, mm:matches, mt:total});
  N.mq = null;
  transition(N, val(sc.go, ctxOf(N)), fx);
  N.last = {kind:'mini', scene:P.scene, step:P.step, art:val(sc.art, c), title:sc.title, qs:P.mq.qs, res, matches, total, text:rw.text, fx, next:N.scene};
  return N;
}

function newGame(prev, cq){
  const seed = Math.floor(Math.random() * 2147483647);
  const keys = Object.keys(MISSIONS);
  const a = keys[Math.floor(Math.random() * keys.length)];
  let b; do { b = keys[Math.floor(Math.random() * keys.length)]; } while (b === a);
  const N0 = {
    v:GAME_V, step:((prev && typeof prev.step === 'number') ? prev.step : 0) + 1, seed, scene:'karakter', from:null,
    stats:{irem:{ce:1, ck:1, ze:1, sa:1}, cengiz:{ce:1, ck:1, ze:1, sa:1}},
    inv:[], npc:{}, flags:{}, uyum:0, kaos:0, wins:{irem:0, cengiz:0},
    missions:{irem:a, cengiz:b}, last:null, log:[], ending:null, dis:null, ikna:0,
    mq:null, mqMatch:0, mqTotal:0, visits:0, qUsed:[], evtUsed:[], evtCount:0, evtRet:null, mqMiss:[],
    qHist:(prev && (Array.isArray(prev.qHist) || Array.isArray(prev.qUsed))) ? Array.from(new Set((prev.qHist || []).concat(prev.qUsed || []))).slice(-500) : [],
    cq:Array.isArray(cq) ? cq.filter(q => q && q.id && q.t && ['tahmin','kim','ayni'].includes(q.kind)).slice(0, 60) : [],
    found:(prev && Array.isArray(prev.found)) ? prev.found.filter(k => ENDINGS[k]) : [],
    jok:{irem:[], cengiz:[]}, jokUsed:{irem:[], cengiz:[]}, jokEarned:{irem:0, cengiz:0}
  };
  const rj = rngFor(seed ^ 0x77d1, 0);
  grantJoker(N0, 'irem', rj); grantJoker(N0, 'cengiz', rj);
  return N0;
}

// ---------- jokerler ----------
function jokAvail(P, p, extraUsed){ const used = (P.jokUsed && P.jokUsed[p]) || [], ex = extraUsed || []; return ((P.jok && P.jok[p]) || []).filter(j => !used.includes(j.id) && !ex.includes(j.id)); }
function jokFind(P, p, t, extraUsed){ return jokAvail(P, p, extraUsed).find(j => j.t === t) || null; }
function grantJoker(N, p, r){ N.jok = N.jok || {irem:[], cengiz:[]}; N.jok[p] = N.jok[p] || []; const t = JOKER_IDS[Math.floor(r() * JOKER_IDS.length)]; N.jok[p].push({id:p[0] + (N.jok[p].length + 1) + t, t}); }
function useJok(N, p, id){ N.jokUsed = N.jokUsed || {irem:[], cengiz:[]}; N.jokUsed[p] = N.jokUsed[p] || []; if (!N.jokUsed[p].includes(id)) N.jokUsed[p].push(id); }
function earnJokers(N, fx, why){
  const r = rngFor(N.seed ^ 0x1f3a, N.step * 7 + 3); N.jokEarned = N.jokEarned || {irem:0, cengiz:0};
  PL.forEach(p => { if ((N.jokEarned[p] || 0) < 1){ grantJoker(N, p, r); N.jokEarned[p] = 1; fx.push({k:'joker', t:`🃏 ${NAMES[p]} yeni bir joker kazandı`}); } });
}

function pickFunny(c, r){ const pool = FUNNY.filter(f => !f.c || f.c(c)); return pool[Math.floor(r() * pool.length)].t; }

// Taş-kağıt-makas: 1 = İrem kazanır, -1 = Cengiz, 0 = berabere
const BEATS = {tas:'makas', makas:'kagit', kagit:'tas'};
function rpsOutcome(a, b){ return a === b ? 0 : BEATS[a] === b ? 1 : -1; }
const validThrow = h => h === 'katil' || h === 'veto' || !!HANDS[h];

// Anlaşmazlık turunu ilerlet. {state:N} (yeni tur) ya da {resolve:dis} döner.
function disAdvance(P, ti, tc){
  if (ti === 'veto' && !jokFind(P, 'irem', 'veto')) ti = 'tas';
  if (tc === 'veto' && !jokFind(P, 'cengiz', 'veto')) tc = 'tas';
  const d = P.dis, hist = d.hist.concat([{i:ti, c:tc}]);
  if (ti === 'katil' || tc === 'katil'){
    let by;
    if (ti === 'katil' && tc === 'katil') by = rngFor(P.seed, P.step * 31 + d.round)() < .5 ? 'irem' : 'cengiz';
    else by = ti === 'katil' ? 'irem' : 'cengiz';
    return {resolve:{mode:'concede', by, hist, both:ti === 'katil' && tc === 'katil'}};
  }
  if (ti === 'veto' && tc === 'veto'){
    // iki veto birbirini götürür: ikisi de harcanır, tur berabere sayılır
    if (d.round < RPS_ROUNDS){ const N = clone(P); N.dis = Object.assign({}, d, {round:d.round + 1, hist}); useJok(N, 'irem', jokFind(P, 'irem', 'veto').id); useJok(N, 'cengiz', jokFind(P, 'cengiz', 'veto').id); return {state:N}; }
    return {resolve:{mode:'dice', hist, useVeto:['irem', 'cengiz']}};
  }
  if (ti === 'veto' || tc === 'veto'){ const w = ti === 'veto' ? 'irem' : 'cengiz'; return {resolve:{mode:'veto', w, hist, useVeto:[w]}}; }
  const o = rpsOutcome(ti, tc);
  if (o === 0){
    if (d.round < RPS_ROUNDS){ const N = clone(P); N.dis = Object.assign({}, d, {round:d.round + 1, hist}); return {state:N}; }
    return {resolve:{mode:'dice', hist}};
  }
  return {resolve:{mode:'rps', w:o > 0 ? 'irem' : 'cengiz', hist}};
}
function openDis(P, vi, vc){ const N = clone(P); N.dis = {step:P.step, round:1, hist:[], i:vi, c:vc}; return N; }

// İki oyla bir hamleyi çöz. Saf fonksiyon. dis: anlaşmazlığın nasıl çözüldüğü.
function resolve(P, vi, vc, dis, jv){
  jv = jv || {};
  const sc = S[P.scene], r = rngFor(P.seed, P.step), c = ctxOf(P);
  const N = clone(P);
  N.step = P.step + 1;
  N.from = P.scene;
  N.dis = null;
  const fx = [];
  const last = {scene:P.scene, step:P.step, i:vi, c:vc, agree:vi === vc, art:val(sc.art, c), title:sc.title, jok:[]};
  // maymuncuk: kilitli seçeneğe oy verildiyse harcanır
  PL.forEach(p => { const v = jv[p]; if (v && v.j === 'maymun'){ const j = jokFind(P, p, 'maymun'); if (j){ useJok(N, p, j.id); last.jok.push({p, t:'maymun'}); } } });
  if (dis && dis.useVeto) dis.useVeto.forEach(p => { const j = jokFind(P, p, 'veto'); if (j){ useJok(N, p, j.id); last.jok.push({p, t:'veto'}); } });
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
    } else if (dis && dis.mode === 'veto'){
      const w = dis.w;
      applied = w === 'irem' ? vi : vc; appliers = [w];
      N.kaos++; N.wins[w]++;
      fx.push({k:'kaos', t:'🌪️ Kaos', v:1});
      last.veto = {w, hist:dis.hist || []};
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
      let bonus = 0;
      appliers.forEach(p => { const v = jv[p]; if (v && v.j === 'sans'){ const j = jokFind(P, p, 'sans'); if (j){ bonus += 3; useJok(N, p, j.id); last.jok.push({p, t:'sans'}); } } });
      const base = appliers.reduce((s, p) => s + P.stats[p][ch.st], 0) + bonus;
      const roll = d6(r), total = base + roll;
      ok = total >= chk.dc;
      last.check = {st:ch.st, base, roll, total, dc:chk.dc, ok, team:appliers.length === 2, who:appliers.length === 1 ? appliers[0] : null, bonus};
    }
    last.text = val(ok ? ch.ok : (ch.fail || ch.ok), c);
    applyFx(N, val(ok ? ch.fx : ch.fxF, c), fx);
    appliers.forEach(p => {
      if (N.stats[p][ch.st] < 8){ N.stats[p][ch.st]++; fx.push({k:'stat', t:`${NAMES[p]} · ${STATS[ch.st][0]} ${STATS[ch.st][1]}`, v:1}); }
    });
    go = ok ? ch.go : (ch.goF || ch.go);
    if (sc.event) earnJokers(N, fx, 'olay');
  }

  N.log.push({scene:P.scene, i:vi, c:vc, a:last.a === undefined ? null : last.a, ok:last.check ? last.check.ok : null,
    m:last.concede ? 'ikna' : last.rps ? 'rps' : last.duel ? 'zar' : null, by:last.concede ? last.concede.by : null});
  transition(N, val(go, ctxOf(N)), fx);
  last.fx = fx;
  last.next = N.scene;
  N.last = last;
  return N;
}
