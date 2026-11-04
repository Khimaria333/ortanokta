// =====================================================================
//  ORTANOKTA MACERASI · ARAYÜZ, AKIŞ VE CANLI BAĞLANTI
// =====================================================================
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const other = p => p === 'irem' ? 'cengiz' : 'irem';
const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct = x => Math.round(x * 100);

const LS = {
  get(k, d){ try { const v = localStorage.getItem('ortanokta:' + k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem('ortanokta:' + k, JSON.stringify(v)); } catch(e){} }
};

// =====================================================================
//  SES (WebAudio ile üretilen küçük efektler)
// =====================================================================
const Sound = {
  ctx:null, on:LS.get('sound', true),
  ensure(){
    if (!this.on) return null;
    try {
      if (!this.ctx){ const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; this.ctx = new AC(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch(e){ return null; }
    return this.ctx;
  },
  tone(f, d, type = 'sine', vol = .08, at = 0, to = null){
    const c = this.ensure(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  noise(d, vol = .05, at = 0){
    const c = this.ensure(); if (!c) return;
    const t = c.currentTime + at, len = Math.floor(c.sampleRate * d), b = c.createBuffer(1, len, c.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 2400; s.buffer = b; g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  },
  play(n){
    if (!this.on) return;
    const T = this;
    ({
      tap(){ T.tone(520, .05, 'triangle', .05); },
      select(){ T.tone(660, .07, 'triangle', .07); T.tone(880, .06, 'triangle', .04, .04); },
      lock(){ T.tone(523, .09, 'triangle', .08); T.tone(784, .14, 'triangle', .08, .08); },
      flip(){ T.noise(.08, .06); T.tone(300, .06, 'square', .025); },
      dice(){ for (let i = 0; i < 7; i++) T.noise(.04, .07, i * .09); },
      land(){ T.tone(180, .12, 'square', .05); T.noise(.05, .06); },
      good(){ [523, 659, 784, 1047].forEach((f, i) => T.tone(f, .18, 'triangle', .08, i * .08)); },
      bad(){ T.tone(392, .18, 'sawtooth', .04); T.tone(311, .3, 'sawtooth', .04, .15); },
      heart(){ T.tone(660, .12, 'sine', .08); T.tone(990, .2, 'sine', .07, .1); },
      clash(){ T.tone(200, .25, 'sawtooth', .05, 0, 90); T.noise(.15, .06); },
      chip(){ T.tone(1200, .05, 'sine', .05); },
      chapter(){ T.tone(220, .7, 'sine', .06, 0, 660); T.tone(330, .7, 'triangle', .04, .1, 990); },
      win(){ [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => T.tone(f, .22, 'triangle', .08, i * .11)); },
      pop(){ T.tone(880, .06, 'sine', .06, 0, 1400); },
      nudge(){ T.tone(140, .35, 'square', .06, 0, 90); },
      turn(){ T.tone(740, .1, 'sine', .06); T.tone(988, .12, 'sine', .05, .1); }
    }[n] || (() => {}))();
  }
};

// =====================================================================
//  SAHNE ÇİZİMLERİ
//  prop: [emoji, x%, alt kenar y%, boyut px, animasyon, ayna]
// =====================================================================
const DAY = 'linear-gradient(#7cc8ff 0%, #bfe6ff 55%, #e9f7ff 100%)';
const ART = {
  title:{sky:'linear-gradient(#ff9a8b 0%, #ffcf9f 45%, #ffe9c8 100%)', g:['#7cc46a','#5aa64e'], hill:true, clouds:3, couple:false,
    props:[['🏘️',14,90,46],['🌳',90,88,46],['🎈',72,56,84,'a-rise'],['🐐',34,92,46,'a-bob'],['🕊️',22,30,22,'a-float']]},
  magic:{sky:'radial-gradient(circle at 50% 65%, #7a4cf0 0%, #2a1760 70%)', stars:40, couple:false, icon:'✨',
    glow:['#b08cff',50,60,180], props:[['🦁',16,84,42,'a-bob'],['✨',34,40,26,'a-pulse'],['🧠',50,70,44,'a-bob2'],['🍀',84,84,42,'a-bob'],['🔮',68,38,30,'a-float']]},
  otogar:{sky:DAY, g:['#a2a2b0','#8a8a98'], flat:true, clouds:2, icon:'🚏',
    props:[['🏢',12,62,62],['🚏',44,62,30],['🚌',26,84,62,'a-bob'],['🚌',76,84,62,'a-bob2',1],['🥯',92,80,24]]},
  kasaba:{sky:DAY, g:['#8fd16f','#6cb653'], hill:true, clouds:2, icon:'🏘️',
    props:[['🏘️',16,66,56],['🏡',82,62,44],['🌳',94,74,40],['🌳',4,74,40],['🚕',76,90,52,'a-bob']]},
  pansiyon:{sky:'repeating-linear-gradient(90deg,#ffdcae 0 26px,#ffd39c 26px 52px)', g:['#b97b4c','#a06639'], flat:true, icon:'🛏️',
    props:[['🖼️',22,38,30],['🪟',74,42,48],['🛏️',26,88,70],['🐈',56,90,30,'a-bob'],['🐈‍⬛',68,92,28,'a-bob2'],['🐈',82,89,32,'a-bob'],['🪴',94,88,34],['👵🏼',10,90,42]]},
  gece:{sky:'linear-gradient(#0b1038 0%, #262a6b 100%)', g:['#1f3d2f','#16291f'], hill:true, stars:46, icon:'🌙',
    glow:['#ffd56a',72,62,40], props:[['🌙',84,32,34,'a-pulse'],['⛺',38,88,62],['🌲',6,80,54],['🌲',94,82,58],['🏮',72,64,20,'a-pulse']]},
  orman:{sky:'linear-gradient(#b5ecae 0%, #6fbf74 100%)', g:['#3f7d45','#2f6136'], hill:true, icon:'🌲',
    props:[['🌲',6,78,62],['🌳',24,70,60,'a-sway'],['🌲',80,76,64],['🌳',96,72,58,'a-sway'],['🍄',42,92,22],['🛖',62,64,26]]},
  ormanGece:{sky:'linear-gradient(#0d1a2b 0%, #1d3b3a 100%)', g:['#183326','#0f2219'], hill:true, stars:26, icon:'🌲',
    glow:['#ffbf4a',62,58,50], props:[['🌲',6,78,62],['🌲',24,72,58],['🌲',80,76,64],['🌲',96,72,58],['🛖',62,64,28,'a-pulse'],['🦉',86,36,24,'a-bob']]},
  kulube:{sky:'linear-gradient(#ffd0a2 0%, #b6ddae 100%)', g:['#5c9a4f','#47803d'], hill:true, icon:'🛖',
    props:[['🌲',8,78,56],['🛖',50,84,82],['💨',57,30,30,'a-float'],['🌲',92,78,60],['🫖',78,92,24],['🪵',26,92,30]]},
  festival:{sky:'linear-gradient(#78ccff 0%, #ffe7b3 100%)', g:['#8bcf6a','#6fb352'], hill:true, bunting:true, icon:'🎪',
    props:[['🎪',22,76,66],['🎡',82,72,72,'a-spin'],['🎈',62,40,40,'a-rise'],['🥁',36,92,30,'a-bob'],['🥒',94,92,28]]},
  tursu:{sky:'repeating-linear-gradient(90deg,#ffe3ad 0 34px,#ffd28c 34px 68px)', g:['#c98b4f','#b07539'], flat:true, bunting:true, icon:'🥒',
    props:[['🫙',16,86,48],['🥬',32,90,34,'a-bob'],['🏆',50,52,36,'a-pulse'],['🥒',70,92,34],['🫙',84,86,48],['💪🏽',94,86,36]]},
  duello:{sky:'radial-gradient(circle at 50% 10%, #ffe68f 0%, #ff8a5c 65%, #c8456b 100%)', g:['#6e3428','#5a2a20'], flat:true, icon:'🏟️',
    glow:['#fff2a8',30,40,90], props:[['💃',30,86,54,'a-bob'],['🏆',50,50,40,'a-pulse'],['🕺',70,86,54,'a-bob2'],['🐐',90,88,30]]},
  panayir:{sky:'linear-gradient(#ff9a8b 0%, #ffd1a1 100%)', g:['#9acb70','#7fb45b'], hill:true, bunting:true, icon:'🎡',
    props:[['🎡',16,74,72,'a-spin'],['🔮',30,88,30,'a-pulse'],['🎯',68,82,32],['🎈',82,58,62,'a-bob'],['😴',84,92,22,'a-pulse']]},
  konusma:{sky:'linear-gradient(#7fd0ff 0%, #ffe7b3 100%)', g:['#8bcf6a','#6fb352'], hill:true, bunting:true, icon:'🎤', couple:false,
    props:[['🎤',50,62,44],['👨‍👩‍👧',16,94,42],['🧔🏻',34,94,36],['👩‍👦',84,94,42],['🐐',66,94,28,'a-bob'],['🙋‍♀️',44,74,34,'a-bob'],['🙋‍♂️',56,74,34,'a-bob2']]},
  balon:{sky:'linear-gradient(#69bfff 0%, #ffe3b3 100%)', g:['#8bcf6a','#6fb352'], hill:true, bunting:true, clouds:2, icon:'🎈',
    props:[['🎪',12,88,46],['🎈',54,46,86,'a-rise'],['🐐',56,52,22,'a-rise'],['😴',84,92,24,'a-pulse']]},
  gokyuzu:{sky:'linear-gradient(#4fb2ff 0%, #c9edff 100%)', clouds:5, couple:false, icon:'☁️',
    props:[['🎈',50,70,104,'a-bob'],['🕊️',18,30,22,'a-float'],['🕊️',84,24,18,'a-float'],['🏘️',14,100,22],['🏘️',86,100,20]]},
  yol:{sky:'linear-gradient(#ffc78a 0%, #fff0d2 100%)', g:['#d6b47c','#c29a5e'], flat:true, icon:'🛣️',
    props:[['🌳',8,74,46],['🎈',76,34,34,'a-float'],['🌳',94,74,46],['🚕',50,92,50,'a-drive']]},
  mahkeme:{sky:'linear-gradient(#bcd4ff 0%, #f2e6ff 100%)', g:['#cbb8a0','#b39e84'], flat:true, icon:'⚖️',
    props:[['🏛️',50,72,84],['⚖️',50,36,28,'a-pulse'],['🎩',22,92,36],['👩🏻‍⚖️',80,92,36],['👥',4,96,36],['👥',96,96,36]]},
  hapis:{sky:'linear-gradient(#5c5f6e 0%, #383a45 100%)', g:['#2b2c34','#23242b'], flat:true, bars:true, icon:'🔒',
    props:[['🕯️',12,80,24,'a-pulse'],['🪑',28,92,34],['🎲',30,72,24,'a-bob'],['🫖',66,90,26],['👮🏻',84,92,46]]},
  baris:{sky:'linear-gradient(#8fd6ff 0%, #fff0c9 100%)', g:['#8bcf6a','#6fb352'], hill:true, bunting:true, icon:'🕊️',
    props:[['🤝',50,58,56,'a-pulse'],['🕊️',20,36,30,'a-float'],['🕊️',80,30,26,'a-float'],['🎉',8,92,34],['🎉',92,92,34]]},
  mutfak:{cx:24, sky:'repeating-linear-gradient(90deg,#fff3dc 0 30px,#ffe9c7 30px 60px)', g:['#e0b48a','#cc9b6c'], flat:true, bunting:true, icon:'🎂',
    props:[['👩‍🍳',92,74,40],['🎂',58,84,80,'a-bob'],['🍫',84,80,24],['🥒',92,90,28]]},
  pazar:{sky:DAY, g:['#c9b08a','#b39a74'], flat:true, bunting:true, clouds:1, icon:'🧺',
    props:[['⛺',12,80,58],['🍅',28,90,24],['🧀',36,90,22],['🍬',66,86,30,'a-bob'],['📷',78,82,30],['⛺',92,80,52]]},
  degirmen:{sky:'linear-gradient(#9d8cc9 0%, #f3c9a1 100%)', g:['#8aa860','#6f8c4b'], hill:true, icon:'🌀',
    props:[['🏚️',24,74,84],['🌀',24,34,34,'a-spin'],['🦉',72,36,24,'a-bob'],['🌾',86,92,34],['👴🏼',94,92,34]]},
  gol:{sky:DAY, g:['#58aee6','#7cc46a'], hill:true, clouds:2, icon:'🦢',
    props:[['🧔🏽',10,72,38],['🎣',20,64,30],['🦢',70,88,42,'a-bob'],['🐟',84,94,20,'a-bob2'],['🌳',94,64,46]]},
  kahve:{sky:'repeating-linear-gradient(90deg,#e9c79a 0 30px,#dfba8a 30px 60px)', g:['#8b5a3c','#734a31'], flat:true, icon:'☕',
    props:[['👴🏽',12,90,42],['🎲',26,84,24,'a-bob'],['☕',36,86,24],['👴🏻',72,90,42],['📻',86,56,30],['🪑',92,92,32]]},
  kutuphane:{sky:'linear-gradient(#e8d8c3 0%, #d9c2a5 100%)', g:['#9b6b45','#865a38'], flat:true, icon:'📚',
    props:[['📚',10,72,52],['🕯️',26,54,22,'a-pulse'],['🖼️',50,40,40],['🐐',50,32,16],['📚',90,72,52],['👩🏻‍🏫',78,92,40]]},
  fener:{sky:'linear-gradient(#141238 0%, #3b2463 100%)', g:['#2a1f3d','#1e1630'], flat:true, stars:40, icon:'🏮',
    glow:['#ff9f43',60,40,120], props:[['🏮',14,42,30,'a-float'],['🏮',34,26,24,'a-float'],['🏮',58,36,30,'a-rise'],['🏮',78,22,22,'a-float'],['🏮',90,48,26,'a-rise'],['🏘️',8,92,40],['🏘️',92,92,40]]},
  veda:{sky:'linear-gradient(#ff8f7a 0%, #ffcf98 55%, #ffe9c9 100%)', g:['#a49aa6','#8c8290'], flat:true, clouds:2, icon:'🚏',
    glow:['#fff1a8',50,40,110], props:[['🚌',20,86,62,'a-bob'],['💌',50,46,28,'a-float'],['🚌',80,86,62,'a-bob2',1],['🚏',8,64,28]]}
};

function stageHTML(key, opts = {}){
  const A = ART[key] || ART.kasaba;
  let h = `<div class="stage" aria-hidden="true"><div class="sky" style="background:${A.sky}"></div>`;
  if (A.glow){ const [c, x, y, s] = A.glow; h += `<div class="glow" style="background:${c};left:${x}%;top:${y}%;width:${s}px;height:${s}px;transform:translate(-50%,-50%);opacity:.6"></div>`; }
  if (A.stars){ for (let i = 0; i < A.stars; i++){ const x = (i * 37.7) % 100, y = (i * 23.3) % 55; h += `<i class="star" style="left:${x}%;top:${y}%;animation-delay:${(i % 7) * .4}s"></i>`; } }
  if (A.clouds){ for (let i = 0; i < A.clouds; i++) h += `<span class="cloud" style="top:${8 + i * 13}%;animation-duration:${34 + i * 9}s;animation-delay:-${i * 11}s">☁️</span>`; }
  if (A.g){
    h += A.flat
      ? `<svg class="ground" viewBox="0 0 400 100" preserveAspectRatio="none"><rect y="38" width="400" height="62" fill="${A.g[1]}"/><rect y="46" width="400" height="54" fill="${A.g[0]}"/></svg>`
      : `<svg class="ground" viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 34 Q90 6 200 30 T400 24 V100 H0Z" fill="${A.g[1]}"/><path d="M0 58 Q120 30 230 54 T400 50 V100 H0Z" fill="${A.g[0]}"/></svg>`;
  }
  if (A.bunting) h += `<div class="bunting"></div><div class="bunting b2"></div>`;
  A.props.forEach(([e, x, y, s, an, fl]) => { h += `<span class="prop ${an || ''} ${fl ? 'flip' : ''}" style="left:${x}%;top:${y}%;font-size:${s}px">${e}</span>`; });
  if (A.couple !== false && opts.couple !== false){
    h += `<div class="couple" style="left:${A.cx || 50}%"><span style="position:relative">👩<b class="tag ti">İREM</b></span><span style="position:relative">👨<b class="tag tc">CENGİZ</b></span>${opts.goat ? '<span style="font-size:24px" class="a-bob">🐐</span>' : ''}</div>`;
  }
  if (A.bars) h += `<div class="bars"></div>`;
  h += `<div class="vignette"></div>`;
  if (opts.loc) h += `<div class="loc"><i>${A.icon || '📍'}</i>${esc(opts.loc)}</div>`;
  return h + `</div>`;
}

// =====================================================================
//  DURUM
// =====================================================================
const PATH = {state:'o3/state', vote:p => 'o3votes/' + p, hand:p => 'o3hands/' + p, ans:p => 'o3ans/' + p};
const G = {
  db:null, room:null, user:null, ref:null, vref:{},
  P:null, V:{irem:null, cengiz:null}, T:{irem:null, cengiz:null}, tref:{}, A:{irem:null, cengiz:null}, aref:{}, asel:null, answering:false, loaded:{p:false, irem:false, cengiz:false}, ready:false, hsel:null, throwing:false,
  me:null, readOnly:false, view:null, viewKey:null, sel:null, voting:false, advancing:-1, starting:false,
  run:0, skip:null, fast:false, peers:[], toastedStep:-1, lastReact:0, nudgeAt:0,
  found:LS.get('found', [])
};
const isMeOnline = () => true;

// ---------- yardımcılar ----------
function validVote(v){
  const P = G.P;
  if (!v || !isGame(P) || P.scene === 'end' || v.step !== P.step || !Number.isInteger(v.choice)) return false;
  const ch = S[P.scene].choices[v.choice];
  return !!ch && isOpen(ch, ctxOf(P));
}
const myVote = () => validVote(G.V[G.me]) ? G.V[G.me].choice : null;
const inDis = () => isGame(G.P) && G.P.dis && G.P.dis.step === G.P.step;
function validHand(t){ const P = G.P; return !!(t && inDis() && t.step === P.step && t.round === P.dis.round && validThrow(t.h)); }
const myHand = () => validHand(G.T[G.me]) ? G.T[G.me].h : null;
const inMini = () => isGame(G.P) && S[G.P.scene] && S[G.P.scene].mini && G.P.mq && G.P.mq.step === G.P.step;
const validAns = t => inMini() && validAnsFor(G.P, t);
const myAns = () => validAns(G.A[G.me]) ? G.A[G.me].a : null;
const KIND_NAME = {tahmin:'Tahmin et', kim:'Kim daha çok?', ayni:'Aynı anda'};
const poss = n => n + "'in";
const partnerVoted = () => validVote(G.V[other(G.me)]);
function seenStep(P){
  const s = LS.get('seen', null);
  if (s && s.seed === P.seed) return s.step;
  return P.last ? P.step - 1 : P.step;
}
function markSeen(P){ LS.set('seen', {seed:P.seed, step:P.step}); }
function chapShown(P){ const s = LS.get('chap', null); return s && s.seed === P.seed ? s.ch : -1; }
function markChap(P, ch){ LS.set('chap', {seed:P.seed, ch}); }
function chParts(ch){ const s = CH[ch] || ''; const [a, b] = s.includes(' · ') ? s.split(' · ') : ['Başlangıç', s]; return [a, b]; }
function partnerPeer(){ return (G.peers || []).find(p => p.presence && p.presence.p === other(G.me) && !p.sameTab); }
function foundList(){ const P = G.P; return (P && Array.isArray(P.found)) ? P.found.filter(k => ENDINGS[k]) : G.found; }

// beat: tıklanınca atlanabilen bekleme
function beat(ms){
  if (G.fast || reduced) return Promise.resolve();
  return new Promise(res => { let done = false; const fin = () => { if (done) return; done = true; clearTimeout(t); if (G.skip === fin) G.skip = null; res(); }; const t = setTimeout(fin, ms); G.skip = fin; });
}
// daktilo efekti (HTML etiketlerini korur)
function typeHTML(el, html, speed = 16){
  return new Promise(res => {
    const tokens = html.match(/<[^>]+>|&[^;\s]+;|[\s\S]/g) || [];
    let i = 0, done = false, t;
    const fin = () => { if (done) return; done = true; clearInterval(t); el.innerHTML = html; el.classList.remove('caret'); if (G.skip === fin) G.skip = null; res(); };
    if (G.fast || reduced){ fin(); return; }
    el.classList.add('caret'); G.skip = fin;
    t = setInterval(() => {
      let n = 0;
      while (i < tokens.length && n < 2){ if (tokens[i][0] !== '<') n++; i++; }
      el.innerHTML = tokens.slice(0, i).join('');
      if (i >= tokens.length) fin();
    }, speed);
  });
}
function scrollEnd(el){ if (el) el.scrollTo({top:el.scrollHeight, behavior:reduced ? 'auto' : 'smooth'}); }

// ---------- efektler ----------
function toast(msg){ const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('#toast').appendChild(t); setTimeout(() => t.remove(), 3100); }
function floaty(e, n = 6){
  if (reduced) n = 1;
  for (let i = 0; i < n; i++){
    const s = document.createElement('span'); s.className = 'floaty'; s.textContent = e;
    s.style.left = (10 + Math.random() * 80) + '%'; s.style.animationDelay = (i * .12) + 's'; s.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
    s.style.fontSize = (24 + Math.random() * 18) + 'px';
    $('#fx').appendChild(s); setTimeout(() => s.remove(), 3200);
  }
}
function confetti(n = 60){
  if (reduced) return;
  const cols = ['#ff5d73','#ffc94a','#21c4b0','#7c5cff','#2bb7da','#ff9fb7'];
  for (let i = 0; i < n; i++){
    const c = document.createElement('i'); c.className = 'conf';
    c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % cols.length];
    c.style.animationDelay = Math.random() * .8 + 's'; c.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
    $('#fx').appendChild(c); setTimeout(() => c.remove(), 4800);
  }
}
function burst(el, e = '❤️', n = 10){
  if (reduced || !el) return;
  const r = el.getBoundingClientRect(), g = $('#game').getBoundingClientRect();
  for (let i = 0; i < n; i++){
    const s = document.createElement('span'); s.className = 'burst'; s.textContent = e;
    s.style.left = (r.left - g.left + r.width / 2) + 'px'; s.style.top = (r.top - g.top + r.height / 2) + 'px';
    const a = (i / n) * Math.PI * 2; s.style.setProperty('--dx', Math.cos(a) * 110 + 'px'); s.style.setProperty('--dy', Math.sin(a) * 90 + 'px');
    $('#fx').appendChild(s); setTimeout(() => s.remove(), 1100);
  }
}
const PIPS = {1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8]};
function dieHTML(v){ return [...Array(9)].map((_, i) => `<i class="${PIPS[v].includes(i) ? 'on' : ''}"></i>`).join(''); }
async function rollDie(el, final, ms = 900){
  if (G.fast || reduced){ el.innerHTML = dieHTML(final); return; }
  el.classList.add('rolling');
  const end = Date.now() + ms;
  await new Promise(res => {
    let done = false;
    const fin = () => { if (done) return; done = true; clearInterval(t); if (G.skip === fin) G.skip = null; res(); };
    const t = setInterval(() => { el.innerHTML = dieHTML(1 + Math.floor(Math.random() * 6)); if (Date.now() > end) fin(); }, 70);
    G.skip = fin;
  });
  el.classList.remove('rolling'); el.innerHTML = dieHTML(final); el.classList.add('landed'); Sound.play('land');
}

// =====================================================================
//  ÇERÇEVE: HUD, oyuncu şeridi, dock
// =====================================================================
function setChrome(mode){
  const inGame = mode === 'game';
  $('#hud').classList.toggle('hidden', !inGame);
  $('#players').classList.toggle('hidden', !inGame);
  $('#dock').classList.toggle('hidden', !inGame);
  if (!inGame){ $('#react').classList.remove('on'); }
}
function updateHUD(){
  const P = G.P; if (!isGame(P)) return;
  const sk = (G.view === 'reveal' && P.last && S[P.last.scene]) ? P.last.scene : P.scene;
  const sc = S[sk];
  if (sk === 'end' || !sc){ $('#hudChap').textContent = 'Final'; $('#hudSub').textContent = (ENDINGS[P.ending] || {}).t || ''; }
  else { const [a, b] = chParts(sc.ch); $('#hudChap').textContent = sc.ch === 0 ? 'Hazırlık' : a; $('#hudSub').textContent = sc.ch ? b + ' · ' + sc.title : sc.title; }
  [['#mUyum', P.uyum], ['#mKaos', P.kaos]].forEach(([s, v]) => {
    const el = $(s), sp = $('span', el);
    if (sp.textContent !== String(v)){ sp.textContent = v; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  });
  const b = $('#bInv'); b.textContent = P.inv.length; b.classList.toggle('hidden', !P.inv.length);
  $('#btnSound').textContent = Sound.on ? '🔊' : '🔇';
}
function playerStatus(p){
  const P = G.P;
  if (p === G.me) {
    if (G.view === 'scene') return myVote() !== null ? 'Kararını verdin ✓' : 'Senin sıran';
    if (G.view === 'reveal') return 'Sonucu izliyorsun';
    if (G.view === 'rps') return myHand() ? 'Hamleni yaptın ✓' : 'Senin sıran';
    if (G.view === 'mini') return myAns() !== null ? 'Cevapladın ✓' : 'Senin sıran';
    return 'Sen';
  }
  const peer = partnerPeer();
  const online = !!peer;
  if (G.view === 'scene' && isGame(P) && validVote(G.V[p])) return 'Kararını verdi ✓';
  if (G.view === 'rps' && validHand(G.T[p])) return 'Hamlesini yaptı ✓';
  if (G.view === 'mini' && validAns(G.A[p])) return 'Cevapladı ✓';
  if (!G.room) return G.view === 'scene' ? 'Bekleniyor…' : '';
  if (!online) return 'Çevrimdışı';
  const pv = peer.presence.view;
  if (pv === 'reveal') return 'Sonucu izliyor';
  if (pv === 'ending') return 'Sonu okuyor';
  if (pv === 'title') return 'Ana menüde';
  if (pv === 'chapter') return 'Bölüm açılıyor';
  if (pv === 'rps') return 'Taş-kağıt-makas';
  if (pv === 'mini') return 'Mini oyunda';
  return 'Düşünüyor…';
}
function chipHTML(p, cls = ''){
  const me = p === G.me, online = me || !!partnerPeer();
  const voted = (G.view === 'scene' && validVote(G.V[p])) || (G.view === 'rps' && validHand(G.T[p])) || (G.view === 'mini' && validAns(G.A[p]));
  return `<div class="pchip ${p} ${me ? 'me' : ''} ${voted ? 'voted' : ''} ${cls}">
    <div class="av">${AV[p]}<i class="dot ${online && (G.room || me) ? 'on' : ''}"></i></div>
    <div class="txt"><div class="nm">${NAMES[p]}${me ? ' <small style="opacity:.7;font-weight:500">(sen)</small>' : ''}</div><div class="st">${esc(playerStatus(p))}</div></div></div>`;
}
function updatePlayers(){
  if (!G.me) return;
  $('#players').innerHTML = chipHTML('irem') + chipHTML('cengiz');
  const lb = $('.lobby'); if (lb) lb.innerHTML = chipHTML('irem') + chipHTML('cengiz');
}

// =====================================================================
//  YÖNLENDİRİCİ
// =====================================================================
function decide(){
  if (!G.ready) return;
  if (!G.me) return show('pick', 'pick');
  const P = G.P;
  if (!isGame(P)) return show('title', 'title');
  if (P.last && seenStep(P) < P.step) return show('reveal', P.seed + ':' + P.step);
  if (P.scene === 'end') return show('ending', P.seed + ':' + P.step);
  const ch = S[P.scene].ch;
  if (chapShown(P) !== ch) return show('chapter', P.seed + ':' + ch);
  if (inDis()) return show('rps', P.seed + ':' + P.step + ':' + P.dis.round);
  if (inMini()) return show('mini', P.seed + ':' + P.step + ':' + P.mq.k);
  return show('scene', P.seed + ':' + P.step);
}
function show(view, key){
  if (G.view === view && G.viewKey === key){ patch(); return; }
  G.run++; G.fast = false; G.skip = null;
  G.view = view; G.viewKey = key; G.sel = null; G.hsel = null; G.asel = null;
  closeSheet();
  ({pick:viewPick, title:viewTitle, chapter:viewChapter, scene:viewScene, rps:viewRps, mini:viewMini, reveal:viewReveal, ending:viewEnding})[view]();
  updatePresence();
}
function patch(){
  updatePlayers(); updateHUD();
  if (G.view === 'scene') patchScene();
  if (G.view === 'rps') patchRps();
  if (G.view === 'mini') patchMini();
  if (G.view === 'title') patchTitle();
  if (G.view === 'pick') patchPick();
}

// ---------- kimsin ----------
function viewPick(){
  setChrome('none');
  $('#screen').innerHTML = `<div class="titlescreen">${stageHTML('title', {couple:false})}
    <div class="logo"><h1>Ortanokta<br><em>Macerası</em></h1><p>İrem & Cengiz</p></div>
    <div class="menu"><div class="welcome">Bu cihazda kim oynuyor?</div>
      <div class="sub">Diğeriniz kendi cihazından aynı linki açıp öbür karakteri seçsin.</div>
      <div class="row"><button class="btn" data-p="irem">🌸 Ben İrem</button><button class="btn teal" data-p="cengiz">🌊 Ben Cengiz</button></div>
      <p class="sub" id="pickNote" style="margin:0;font-size:12.5px"></p>
      <p class="sub" style="margin:0;font-size:12.5px">Seçimin bu cihazda hatırlanır. İstersen sonra ⚙️ Ayarlar'dan değiştirebilirsin.</p>
    </div></div>`;
  patchPick();
  $$('[data-p]').forEach(b => b.onclick = () => { Sound.play('select'); setMe(b.dataset.p); });
}
function patchPick(){
  const n = $('#pickNote'); if (!n) return;
  const taken = PL.filter(p => (G.peers || []).some(x => !x.sameTab && x.presence && x.presence.p === p));
  n.textContent = taken.length ? `Şu an başka bir cihazda ${taken.map(p => NAMES[p]).join(' ve ')} olarak oynayan biri var.` : '';
}
function setMe(p){ G.me = p; LS.set('who', p); G.view = null; updatePresence(); decide(); }

// ---------- başlık ----------
function viewTitle(){
  setChrome('none');
  const f = foundList();
  $('#screen').innerHTML = `<div class="titlescreen">${stageHTML('title', {couple:false})}
    <div class="logo"><h1>Ortanokta<br><em>Macerası</em></h1><p>İrem & Cengiz</p></div>
    <div class="menu">
      ${G.readOnly ? `<div class="notice" style="margin:0">Bu sayfada oynama iznin yok. Cengiz'in seni e-postayla <b>Editor</b> olarak davet etmesi gerekiyor.</div>` : ''}
      <div class="welcome">Hoş geldin, ${NAMES[G.me]}! ${AV[G.me]}</div>
      <div class="sub">Haritanın tam ortasında bir buluşma. Ve bir keçi.</div>
      <div class="lobby"></div>
      <button class="btn" id="tStart" ${G.readOnly || G.starting ? 'disabled' : ''}>🎈 Yeni macera başlat</button>
      <div class="row"><button class="btn ghost small" style="flex:1" id="tHow">📖 Nasıl oynanır</button><button class="btn ghost small" style="flex:1" id="tGal">🏆 Sonlar ${f.length}/${ENDING_ORDER.length}</button></div>
      <div class="row"><button class="btn ghost small" style="flex:1" id="tSet">⚙️ Ayarlar</button></div>
      <p class="sub" style="margin:0;font-size:12.5px">Biriniz başlatınca diğerinin ekranında da oyun kendiliğinden açılır.</p>
    </div></div>`;
  $('#tStart').onclick = () => { Sound.play('lock'); startGame(); };
  $('#tHow').onclick = () => openSheet('how');
  $('#tGal').onclick = () => openSheet('galeri');
  $('#tSet').onclick = () => openSheet('ayarlar');
  updatePlayers();
}
function patchTitle(){ updatePlayers(); }

// ---------- bölüm kartı ----------
function viewChapter(){
  setChrome('none');
  const P = G.P, ch = S[P.scene].ch, [a, b] = chParts(ch);
  const orn = ['✨','🚌','🗺️','🥒','🎈','⚖️','🏮'][ch] || '✨';
  $('#screen').innerHTML = `<div class="full chapcard" id="chapc" role="button" tabindex="0" aria-label="Devam et">
    <div class="orn">${orn}</div><div class="num">${esc(ch === 0 ? 'Başlangıç' : a)}</div><h2>${esc(b)}</h2><p>${esc(CH_SUB[ch] || '')}</p>
    <div class="hint">Devam etmek için dokun</div></div>`;
  Sound.play('chapter');
  const run = G.run;
  const go = () => { if (run !== G.run) return; markChap(P, ch); G.view = null; decide(); };
  const el = $('#chapc'); el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') go(); };
  setTimeout(go, reduced ? 800 : 3200);
}

// ---------- sahne ----------
function choiceHTML(ch, i, c, sc){
  const P = G.P, open = isOpen(ch, c), me = G.me;
  let tags = '';
  if (!open) tags = `<span class="tag bad">🔒 ${esc(ch.rq || 'Kilitli')}</span>`;
  else if (sc.individual) tags = `<span class="tag good">${STATS[ch.st][0]} ${STATS[ch.st][1]} +2</span>`;
  else {
    const mine = P.stats[me][ch.st], theirs = P.stats[other(me)][ch.st];
    tags = `<span class="tag">${STATS[ch.st][0]} ${STATS[ch.st][1]} · sen ${mine}</span>`;
    const chk = checkOf(ch, c);
    if (chk){
      const team = passChance(mine + theirs, chk.dc), solo = passChance(mine, chk.dc);
      tags += `<span class="tag ${team >= .67 ? 'good' : team >= .34 ? 'mid' : 'bad'}">🎲 Zorluk ${chk.dc} · birlikte %${pct(team)} · tek %${pct(solo)}</span>`;
    }
  }
  return `<button class="choice ${open ? '' : 'locked'}" data-i="${i}" ${open ? '' : 'aria-disabled="true"'} style="animation-delay:${i * 70}ms">
    <span class="k">${open ? 'ABCDEF'[i] : '🔒'}</span>
    <span class="body"><span class="ct">${esc(ch.t)}</span>${ch.d ? `<span class="cd">${esc(ch.d)}</span>` : ''}<span class="tags">${tags}</span></span></button>`;
}
function viewScene(){
  setChrome('game'); updateHUD();
  const P = G.P, sc = S[P.scene], c = ctxOf(P);
  const sp = SPEAKERS[val(sc.sp, c)] || SPEAKERS.anlatici;
  const [a] = chParts(sc.ch);
  $('#screen').innerHTML = `${stageHTML(val(sc.art, c), {loc:sc.title, goat:c.has('profesor') && P.scene !== 'karakter'})}
    <section class="panel">
      <div class="speaker"><span class="face">${sp[0]}</span>${esc(sp[1])}</div>
      <div class="scroll" id="sc">
        <div class="kicker">${esc(sc.ch === 0 ? 'Hazırlık' : a)} · Hamle ${P.log.length + 1}</div>
        <div class="title">${esc(sc.title)}</div>
        ${G.readOnly ? `<div class="notice" style="margin:0 0 8px">Sadece izleyebilirsin: oy verme iznin yok.</div>` : ''}
        <div class="story" id="story"></div>
        <div class="tapnote" id="tapnote">Metni geçmek için dokun</div>
        <div class="choices hidden" id="choices">${sc.choices.map((ch, i) => choiceHTML(ch, i, c, sc)).join('')}</div>
      </div>
      <div class="actionbar" id="ab"></div>
    </section>`;
  const run = G.run, scEl = $('#sc');
  scEl.onclick = e => { if (G.skip && !e.target.closest('.choice')) G.skip(); };
  const typedKey = P.seed + ':' + P.step;
  const already = LS.get('typed', '') === typedKey;
  (already ? Promise.resolve($('#story').innerHTML = val(sc.text, c)) : typeHTML($('#story'), val(sc.text, c))).then(() => {
    if (run !== G.run) return;
    LS.set('typed', typedKey);
    $('#tapnote').remove();
    $('#choices').classList.remove('hidden');
    $$('.choice', scEl).forEach(b => b.onclick = () => onChoice(+b.dataset.i));
    G.sel = myVote();
    patchScene();
    if (!already) setTimeout(() => scrollEnd(scEl), 60);
  });
  patchScene();
}
function onChoice(i){
  const P = G.P, ch = S[P.scene].choices[i];
  if (G.readOnly) return toast('Oy verme iznin yok.');
  if (!isOpen(ch, ctxOf(P))){ Sound.play('bad'); toast('🔒 ' + (ch.rq || 'Bu seçenek kilitli')); return; }
  if (myVote() !== null && myVote() !== i && partnerVoted()) return;
  if (myVote() !== null && myVote() === i) return;
  G.sel = i; Sound.play('select');
  if (myVote() !== null) castVote(i); // kararı değiştirme
  patchScene();
}
function patchScene(){
  const ab = $('#ab'); if (!ab || G.view !== 'scene') return;
  const P = G.P, mv = myVote(), pv = partnerVoted(), partner = NAMES[other(G.me)];
  $$('.choice').forEach(b => b.classList.toggle('sel', +b.dataset.i === (mv !== null ? mv : G.sel)));
  if ($('#choices') && $('#choices').classList.contains('hidden')){ ab.innerHTML = `<div class="waitbox">📖 Hikâyeyi okuyorsun…</div>`; return; }
  if (G.readOnly){ ab.innerHTML = `<div class="waitbox">👀 İzleyici modundasın.</div>`; return; }
  if (mv === null){
    ab.innerHTML = `<div class="waitbox" style="flex:1.2">${pv ? `✅ <span><b>${partner}</b> kararını verdi. Sıra sende!</span>` : `🤔 <span>Bir seçenek seç ve kararını kilitle.</span>`}</div>
      <button class="btn violet small" id="lockBtn" ${G.sel === null || G.voting ? 'disabled' : ''}>🔒 Kilitle</button>`;
    $('#lockBtn').onclick = () => { if (G.sel !== null) castVote(G.sel); };
  } else {
    const t = S[P.scene].choices[mv];
    ab.innerHTML = `<div class="waitbox"><span class="spin"></span><span>Kararın: <b>${esc(t.s)}</b><br>${esc(partner)} bekleniyor${pv ? '' : '. Fikrini değiştirebilirsin.'}</span></div>`;
  }
  if (pv && mv === null && G.toastedStep !== P.step){ G.toastedStep = P.step; Sound.play('turn'); }
}

async function castVote(i){
  const P = G.P;
  if (!isGame(P) || G.readOnly || G.voting || P.scene === 'end') return;
  if (!isOpen(S[P.scene].choices[i], ctxOf(P))) return;
  G.voting = true; patchScene();
  try { await G.vref[G.me].set({step:P.step, choice:i}); Sound.play('lock'); }
  catch(e){ writeErr(e); }
  G.voting = false; patchScene(); updatePlayers();
  tryAdvance();
}
async function tryAdvance(){
  const P = G.P;
  if (!isGame(P) || G.readOnly || P.scene === 'end') return;
  if (S[P.scene].mini){
    if (!inMini() || !validAns(G.A.irem) || !validAns(G.A.cengiz)) return;
    const qk = P.step + ':q' + P.mq.k;
    if (G.advancing === qk) return;
    G.advancing = qk;
    try { await G.ref.set(mqAdvance(P, G.A.irem.a, G.A.cengiz.a)); } catch(e){ G.advancing = -1; writeErr(e); }
    return;
  }
  if (!validVote(G.V.irem) || !validVote(G.V.cengiz)) return;
  const vi = G.V.irem.choice, vc = G.V.cengiz.choice, sc = S[P.scene];
  let N, key;
  if (vi === vc || sc.individual){ key = P.step + ':r'; N = resolve(P, vi, vc); }
  else if (!inDis()){ key = P.step + ':d'; N = openDis(P, vi, vc); }
  else {
    if (!validHand(G.T.irem) || !validHand(G.T.cengiz)) return;
    key = P.step + ':h' + P.dis.round;
    const out = disAdvance(P, G.T.irem.h, G.T.cengiz.h);
    N = out.state || resolve(P, P.dis.i, P.dis.c, out.resolve);
  }
  if (G.advancing === key) return;
  G.advancing = key;
  try { await G.ref.set(N); } catch(e){ G.advancing = -1; writeErr(e); }
}

// ---------- taş-kağıt-makas ----------
function viewRps(){
  setChrome('game'); updateHUD();
  const P = G.P, sc = S[P.scene], d = P.dis, c = ctxOf(P), me = G.me, op = other(me);
  const mine = me === 'irem' ? d.i : d.c, theirs = me === 'irem' ? d.c : d.i;
  const chM = sc.choices[mine], chT = sc.choices[theirs];
  const odds = (ch, power) => { const k = checkOf(ch, c); return k ? ` <span class="tag ${passChance(power, k.dc) >= .67 ? 'good' : passChance(power, k.dc) >= .34 ? 'mid' : 'bad'}">🎲 %${pct(passChance(power, k.dc))}</span>` : ''; };
  const last = d.hist[d.hist.length - 1];
  $('#screen').innerHTML = `${stageHTML(val(sc.art, c), {loc:sc.title, goat:c.has('profesor')}).replace('class="stage"', 'class="stage short"')}
    <section class="panel">
      <div class="speaker"><span class="face">⚔️</span>Anlaşmazlık</div>
      <div class="scroll" id="rp">
        <div class="kicker">Anlaşmazlık · Tur ${d.round}/${RPS_ROUNDS}</div>
        <div class="title">${d.round > 1 ? 'Berabere! Bir tur daha' : 'Farklı karar verdiniz!'}</div>
        ${last ? `<div class="drawnote pop">İkiniz de ${HANDS[last.i][0]} <b>${HANDS[last.i][1]}</b> attınız.${d.round === RPS_ROUNDS ? ' Bu tur da berabere biterse zarlar karar verecek!' : ''}</div>` : ''}
        <div class="wants">
          <div class="want ${me}"><small>${AV[me]} Sen istiyorsun</small><b>${esc(chM.t)}</b></div>
          <div class="want ${op}"><small>${AV[op]} ${NAMES[op]} istiyor</small><b>${esc(chT.t)}</b></div>
        </div>
        <div class="stratbox">
          <div>🏆 <b>Kazanırsan</b> senin kararın geçer: ${esc(chM.s)}${odds(chM, P.stats[me][chM.st])}</div>
          <div>🤝 <b>Katılırsan</b> kaos olmaz, ${esc(chT.s)} ikinizin gücüyle yapılır${odds(chT, P.stats.irem[chT.st] + P.stats.cengiz[chT.st])}</div>
          <div>😵 <b>Kaybedersen</b> ${NAMES[op]} tek başına yapar${odds(chT, P.stats[op][chT.st])}</div>
        </div>
        <div class="hands">${Object.keys(HANDS).map(h => `<button class="hand" data-h="${h}"><span>${HANDS[h][0]}</span>${HANDS[h][1]}</button>`).join('')}</div>
        <button class="hand concede" data-h="katil">🤝 ${NAMES[op]}'in fikrine katıl</button>
      </div>
      <div class="actionbar" id="ab"></div>
    </section>`;
  $$('.hand').forEach(b => b.onclick = () => {
    if (G.readOnly) return toast('Oynama iznin yok.');
    if (myHand()) return;
    G.hsel = b.dataset.h; Sound.play('select'); patchRps();
  });
  if (d.round === 1) Sound.play('clash'); else Sound.play('turn');
  patchRps();
}
function patchRps(){
  const ab = $('#ab'); if (!ab || G.view !== 'rps' || !inDis()) return;
  const mh = myHand(), ph = validHand(G.T[other(G.me)]), op = NAMES[other(G.me)];
  $$('.hand').forEach(b => { b.classList.toggle('sel', b.dataset.h === (mh || G.hsel)); b.disabled = !!mh; });
  if (G.readOnly){ ab.innerHTML = `<div class="waitbox">👀 İzleyici modundasın.</div>`; return; }
  if (!mh){
    const lbl = G.hsel === 'katil' ? '🤝 Katıl' : G.hsel ? HANDS[G.hsel][0] + ' At!' : '✊ At!';
    ab.innerHTML = `<div class="waitbox" style="flex:1.2">${ph ? `✅ <span><b>${op}</b> hamlesini yaptı. Sıra sende!</span>` : `🤔 <span>Gizlice seç: taş, kağıt, makas… ya da katıl.</span>`}</div>
      <button class="btn violet small" id="throwBtn" ${!G.hsel || G.throwing ? 'disabled' : ''}>${lbl}</button>`;
    $('#throwBtn').onclick = () => { if (G.hsel) castHand(G.hsel); };
  } else {
    ab.innerHTML = `<div class="waitbox"><span class="spin"></span><span>Hamlen: <b>${mh === 'katil' ? '🤝 Katıl' : HANDS[mh][0] + ' ' + HANDS[mh][1]}</b><br>${esc(op)} bekleniyor…</span></div>`;
  }
}
async function castHand(h){
  const P = G.P;
  if (!inDis() || G.readOnly || G.throwing || myHand()) return;
  G.throwing = true; patchRps();
  try { await G.tref[G.me].set({step:P.step, round:P.dis.round, h}); Sound.play('lock'); }
  catch(e){ writeErr(e); }
  G.throwing = false; patchRps(); updatePlayers();
  tryAdvance();
}

// ---------- mini oyun ----------
function qView(q, me){
  const Q = QBY[q.id], sub = q.sub;
  if (q.kind === 'tahmin'){
    if (me === sub) return {lead:`🤫 Kendin için dürüstçe cevapla. ${NAMES[other(me)]} tahmin edecek.`, text:Q.t};
    const g = Q.g; return {lead:`🔮 ${NAMES[sub]} kendisi için ne seçti? Tahmin et!`, text:`${NAMES[sub]} ${g}`};
  }
  if (q.kind === 'kim') return {lead:'İkiniz de aynı anda cevaplıyorsunuz. Aynı ismi seçerseniz puan!', text:Q.t};
  return {lead:'İkinize de aynı soru. Aynı cevabı verirseniz puan!', text:Q.t};
}
function qTitle(q){ const Q = QBY[q.id]; return q.kind === 'tahmin' ? `${NAMES[q.sub]} ${Q.g}` : Q.t; }
function mqResultHTML(q, r, big){
  const opts = qOptions(QBY[q.id], q.kind), A = x => esc(opts[x] || '?');
  let rows;
  if (q.kind === 'tahmin'){
    const truth = q.sub === 'irem' ? r.i : r.c, guess = q.sub === 'irem' ? r.c : r.i, gs = other(q.sub);
    rows = `<div class="ans ${q.sub}"><small>${AV[q.sub]} ${poss(NAMES[q.sub])} cevabı</small><b>${A(truth)}</b></div><div class="ans ${gs}"><small>${AV[gs]} ${poss(NAMES[gs])} tahmini</small><b>${A(guess)}</b></div>`;
  } else rows = `<div class="ans irem"><small>🌸 İrem</small><b>${A(r.i)}</b></div><div class="ans cengiz"><small>🌊 Cengiz</small><b>${A(r.c)}</b></div>`;
  return `<div class="qres ${r.m ? 'ok' : 'no'} ${big ? 'big' : ''}"><div class="qh"><span class="kd">${KIND_NAME[q.kind]}</span><span class="stampres ${r.m ? 'ok' : 'no'}">${r.m ? (q.kind === 'tahmin' ? 'BİLDİ!' : 'EŞLEŞTİ!') : 'TUTMADI'}</span></div>
    <div class="qq">${esc(qTitle(q))}</div><div class="answers">${rows}</div></div>`;
}
function scoreDots(mq){ return `<div class="dots">${mq.qs.map((_, k) => { const r = mq.res[k]; return `<span class="${r ? (r.m ? 'ok' : 'no') : k === mq.k ? 'cur' : ''}">${r ? (r.m ? '💞' : '✗') : k + 1}</span>`; }).join('')}</div>`; }
function viewMini(){
  setChrome('game'); updateHUD();
  const P = G.P, sc = S[P.scene], mq = P.mq, k = mq.k, c = ctxOf(P), me = G.me, q = mq.qs[k];
  const sp = SPEAKERS[val(sc.sp, c)] || SPEAKERS.anlatici;
  const ackKey = P.seed + ':' + P.step + ':' + k;
  const needAck = k > 0 && LS.get('mqack', '') !== ackKey;
  const qv = qView(q, me), opts = qOptions(QBY[q.id], q.kind);
  $('#screen').innerHTML = `${stageHTML(val(sc.art, c), {loc:sc.title, goat:c.has('profesor')}).replace('class="stage"', 'class="stage short"')}
    <section class="panel">
      <div class="speaker"><span class="face">${sp[0]}</span>${esc(sp[1])}</div>
      <div class="scroll" id="mn">
        <div class="kicker">🎯 Mini oyun · ${needAck ? 'Sonuç' : KIND_NAME[q.kind] + ' · Soru ' + (k + 1) + '/' + mq.qs.length}</div>
        <div class="title">${esc(sc.title)}</div>
        ${scoreDots(mq)}
        ${needAck ? mqResultHTML(mq.qs[k - 1], mq.res[k - 1], true) : `
          ${k === 0 ? `<div class="story" id="mIntro"></div>` : ''}
          <div class="qcard ${k === 0 ? 'hidden' : ''}" id="qc">
            <div class="lead">${esc(qv.lead)}</div>
            <div class="qtext">${esc(qv.text)}</div>
            <div class="qopts ${q.kind === 'kim' ? 'two' : ''}">${opts.map((o, i) => `<button class="qopt" data-a="${i}">${esc(o)}</button>`).join('')}</div>
          </div>`}
      </div>
      <div class="actionbar" id="ab"></div>
    </section>`;
  const run = G.run, mn = $('#mn');
  mn.onclick = e => { if (G.skip && !e.target.closest('.qopt')) G.skip(); };
  if (needAck){
    const r = mq.res[k - 1];
    Sound.play(r.m ? 'heart' : 'bad'); if (r.m) burst($('.qres'), '💞', 10);
    $('#ab').innerHTML = `<button class="btn" id="nextQ">Sonraki soru ▶</button>`;
    $('#nextQ').onclick = () => { Sound.play('tap'); LS.set('mqack', ackKey); G.view = null; decide(); };
    return;
  }
  const wire = () => {
    $$('.qopt').forEach(b => b.onclick = () => {
      if (G.readOnly) return toast('Oynama iznin yok.');
      if (myAns() !== null) return;
      G.asel = +b.dataset.a; Sound.play('select'); patchMini();
    });
    patchMini();
  };
  if (k === 0){
    const key = P.seed + ':' + P.step + ':intro', already = LS.get('typed', '') === key;
    const show = () => { if (run !== G.run) return; LS.set('typed', key); $('#qc').classList.remove('hidden'); wire(); setTimeout(() => scrollEnd(mn), 60); };
    if (already){ $('#mIntro').innerHTML = sc.mini.intro; show(); }
    else { patchMini(); typeHTML($('#mIntro'), sc.mini.intro).then(show); }
  } else { Sound.play('turn'); wire(); }
}
function patchMini(){
  const ab = $('#ab'); if (!ab || G.view !== 'mini' || !inMini() || $('#nextQ')) return;
  const ma = myAns(), pa = validAns(G.A[other(G.me)]), op = NAMES[other(G.me)];
  const qc = $('#qc');
  if (qc && qc.classList.contains('hidden')){ ab.innerHTML = `<div class="waitbox">📖 Hikâyeyi okuyorsun…</div>`; return; }
  $$('.qopt').forEach(b => { b.classList.toggle('sel', +b.dataset.a === (ma !== null ? ma : G.asel)); b.disabled = ma !== null; });
  if (G.readOnly){ ab.innerHTML = `<div class="waitbox">👀 İzleyici modundasın.</div>`; return; }
  if (ma === null){
    ab.innerHTML = `<div class="waitbox" style="flex:1.2">${pa ? `✅ <span><b>${op}</b> cevapladı. Sıra sende!</span>` : `🤔 <span>Cevabını seç ve kilitle. ${op} göremez.</span>`}</div>
      <button class="btn violet small" id="ansBtn" ${G.asel === null || G.answering ? 'disabled' : ''}>🔒 Kilitle</button>`;
    $('#ansBtn').onclick = () => { if (G.asel !== null) castAns(G.asel); };
  } else {
    const opts = qOptions(QBY[G.P.mq.qs[G.P.mq.k].id], G.P.mq.qs[G.P.mq.k].kind);
    ab.innerHTML = `<div class="waitbox"><span class="spin"></span><span>Cevabın: <b>${esc(opts[ma])}</b><br>${esc(op)} bekleniyor…</span></div>`;
  }
}
async function castAns(a){
  const P = G.P;
  if (!inMini() || G.readOnly || G.answering || myAns() !== null) return;
  G.answering = true; patchMini();
  try { await G.aref[G.me].set({step:P.step, k:P.mq.k, a}); Sound.play('lock'); }
  catch(e){ writeErr(e); }
  G.answering = false; patchMini(); updatePlayers();
  tryAdvance();
}
function viewRevealMini(){
  setChrome('game'); updateHUD();
  const P = G.P, L = P.last, sc = S[L.scene], run = G.run, alive = () => run === G.run;
  $('#screen').innerHTML = `${stageHTML(L.art, {loc:L.title, goat:false})}
    <section class="panel">
      <div class="scroll" id="rv">
        <div class="kicker">🎯 Mini oyun sonucu</div>
        <div class="title">${esc(L.title)}</div>
        <div class="reveal" id="rvBody"></div>
      </div>
      <div class="actionbar" id="ab"><button class="btn ghost small" id="skipAll" style="flex:1">⏩ Hızlı geç</button></div>
    </section>`;
  const rv = $('#rv'), body = $('#rvBody');
  rv.onclick = () => { if (G.skip) G.skip(); };
  $('#skipAll').onclick = e => { e.stopPropagation(); G.fast = true; if (G.skip) G.skip(); };
  const add = html => { const d = document.createElement('div'); d.innerHTML = html; const el = d.firstElementChild; body.appendChild(el); scrollEnd(rv); return el; };
  (async () => {
    const lastK = L.qs.length - 1;
    // önceki sorular küçük, son soru büyük ve sesli
    if (lastK > 0) add(`<div class="minisum">${L.qs.slice(0, lastK).map((q, k) => `<span class="${L.res[k].m ? 'ok' : 'no'}">${L.res[k].m ? '💞' : '✗'} ${esc(qTitle(q))}</span>`).join('')}</div>`);
    await beat(500); if (!alive()) return;
    const el = add(mqResultHTML(L.qs[lastK], L.res[lastK], true));
    Sound.play(L.res[lastK].m ? 'heart' : 'bad'); if (L.res[lastK].m) burst(el, '💞', 10);
    await beat(900); if (!alive()) return;
    const perfect = L.matches === L.total;
    const b = add(`<div class="banner ${L.matches * 2 >= L.total ? 'agree' : 'dis'}">🎯 ${L.matches} / ${L.total}<small>${perfect ? 'Kusursuz! Birbirinizi ezbere biliyorsunuz.' : L.matches * 2 >= L.total ? 'Güzel uyum!' : 'Daha çok konuşmanız lazım…'}</small></div>`);
    Sound.play(perfect ? 'win' : L.matches ? 'good' : 'bad'); if (perfect){ burst(b, '💞', 14); confetti(30); }
    await beat(600); if (!alive()) return;
    const n = add(`<div class="narr"></div>`);
    await typeHTML(n, L.text); if (!alive()) return;
    if (L.fx && L.fx.length){
      await beat(300); if (!alive()) return;
      const fl = add(`<div class="fxlist"></div>`);
      for (const f of L.fx){
        let cls = 'gold', txt = f.t;
        if (f.k === 'item'){ cls = f.plus ? 'plus' : 'minus'; txt = (f.plus ? 'Yeni: ' : 'Kaybedildi: ') + f.t; }
        else if (f.k === 'npc'){ cls = f.v > 0 ? 'plus' : 'minus'; txt = f.t + ' ' + (f.v > 0 ? '❤️+' + f.v : '💔' + f.v); }
        else if (f.k === 'uyum'){ cls = 'plus'; txt = '💞 Uyum +' + (f.v || 1); }
        else if (f.k === 'kaos'){ cls = 'minus'; txt = '🌪️ Kaos +' + (f.v || 1); }
        fl.insertAdjacentHTML('beforeend', `<span class="fxchip ${cls}">${esc(txt)}</span>`);
        Sound.play('chip'); scrollEnd(rv);
        await beat(140); if (!alive()) return;
      }
    }
    G.fast = false;
    const toEnd = L.next === 'end', nextCh = !toEnd && S[L.next] && S[L.next].ch !== sc.ch;
    $('#ab').innerHTML = `<button class="btn ${toEnd ? 'gold' : ''}" id="contBtn">${toEnd ? '🏁 Sonu gör' : nextCh ? '📖 Yeni bölüme geç ▶' : 'Devam ▶'}</button>`;
    $('#contBtn').onclick = () => { Sound.play('tap'); markSeen(P); G.view = null; decide(); };
    scrollEnd(rv);
  })();
}

// ---------- sonuç gösterimi ----------
function viewReveal(){
  if (G.P.last && G.P.last.kind === 'mini') return viewRevealMini();
  setChrome('game'); updateHUD();
  const P = G.P, L = P.last, sc = S[L.scene], run = G.run;
  const ind = L.kind === 'ind';
  const card = (p, idx) => `<div class="fcard ${p}" id="fc-${p}"><div class="inner">
      <div class="back"><span class="q">?</span><span style="font-size:13px;margin-top:4px">${NAMES[p]}</span></div>
      <div class="face"><div class="who">${AV[p]} ${NAMES[p]}</div><div class="what">${esc(sc.choices[idx].t)}</div></div></div></div>`;
  $('#screen').innerHTML = `${stageHTML(L.art, {loc:L.title, goat:false})}
    <section class="panel">
      <div class="scroll" id="rv">
        <div class="kicker">${ind ? 'Süper güçler' : 'Kararlar açılıyor'}</div>
        <div class="title">${esc(L.title)}</div>
        <div class="reveal" id="rvBody">
          <div class="flipcards">${card('irem', L.i)}${card('cengiz', L.c)}</div>
        </div>
      </div>
      <div class="actionbar" id="ab"><button class="btn ghost small" id="skipAll" style="flex:1">⏩ Hızlı geç</button></div>
    </section>`;
  const rv = $('#rv'), body = $('#rvBody');
  rv.onclick = () => { if (G.skip) G.skip(); };
  $('#skipAll').onclick = e => { e.stopPropagation(); G.fast = true; if (G.skip) G.skip(); };
  const add = html => { const d = document.createElement('div'); d.innerHTML = html; const el = d.firstElementChild; body.appendChild(el); scrollEnd(rv); return el; };
  const alive = () => run === G.run;

  (async () => {
    await beat(500); if (!alive()) return;
    $('#fc-irem').classList.add('open'); Sound.play('flip');
    await beat(380); if (!alive()) return;
    $('#fc-cengiz').classList.add('open'); Sound.play('flip');
    await beat(650); if (!alive()) return;

    if (ind){
      const b = add(`<div class="banner ${L.agree ? 'agree' : 'dis'}">${L.agree ? '💞 Aynı süper güç!' : '⚡ Takım kuruldu!'}<small>${L.agree ? 'Bu konuda yenilmezsiniz. Uyum +1' : 'Farklı güçler, dengeli bir takım.'}</small></div>`);
      Sound.play(L.agree ? 'heart' : 'good'); if (L.agree) burst(b, '💞');
    } else if (L.agree){
      const b = add(`<div class="banner agree">💞 UYUM!<small>Aynı kararı verdiniz. Güçleriniz birleşiyor.</small></div>`);
      Sound.play('heart'); burst(b, '❤️', 12);
    } else {
      const H = x => `${HANDS[x] ? HANDS[x][0] : '🤝'}`;
      const histHTML = hs => hs.length ? `<div class="rpshist">${hs.map((h, k) => `<span>Tur ${k + 1}: ${H(h.i)} vs ${H(h.c)}</span>`).join('')}</div>` : '';
      const crown = w => { const wc = $('#fc-' + w), lc = $('#fc-' + other(w)); wc.classList.add('win'); lc.classList.add('lose'); $('.inner', wc).insertAdjacentHTML('afterend', '<span class="crown">👑</span>'); };
      if (L.concede){
        const k = L.concede, draws = k.hist.slice(0, -1);
        const b = add(`<div class="banner agree">🤝 İKNA!<small>${k.both ? 'İkiniz de birbirinizin fikrine katıldınız! Kura çekildi: ' : ''}${NAMES[k.by]}, ${NAMES[other(k.by)]}'in fikrine katıldı. Kaos yok, güçleriniz birleşiyor.</small></div>`);
        if (draws.length) add(histHTML(draws));
        Sound.play('heart'); burst(b, '🤝', 8);
        const acc = other(k.by), ac = $('#fc-' + acc), lc = $('#fc-' + k.by);
        ac.classList.add('win'); lc.classList.add('lose'); $('.inner', ac).insertAdjacentHTML('afterend', '<span class="crown">🤝</span>');
      } else if (L.rps){
        const R = L.rps, last = R.hist[R.hist.length - 1], draws = R.hist.slice(0, -1);
        add(`<div class="banner dis">⚔️ ANLAŞMAZLIK!<small>Taş, kağıt, makas: kazananın kararı geçer</small></div>`);
        Sound.play('clash');
        if (draws.length){ await beat(500); if (!alive()) return; add(histHTML(draws.map(h => h)).replace('class="rpshist"', 'class="rpshist" title="Berabere turlar"')); }
        await beat(600); if (!alive()) return;
        add(`<div class="dicebox"><h4>Taş · Kağıt · Makas <span>${draws.length ? 'Tur ' + R.hist.length : 'Tek atış'}</span></h4><div class="duel">
          <div class="side irem" id="sdI"><span class="lbl">🌸 İrem</span><span class="bighand" id="hI">✊</span><span class="eq" id="nI">…</span></div>
          <div class="vs">VS</div>
          <div class="side cengiz" id="sdC"><span class="lbl">🌊 Cengiz</span><span class="bighand flipx" id="hC">✊</span><span class="eq" id="nC">…</span></div>
        </div><p id="duelRes" style="margin:10px 0 0;font-weight:700;font-size:14px"></p></div>`);
        if (!G.fast && !reduced){
          $('#hI').classList.add('pumping'); $('#hC').classList.add('pumping');
          for (let k = 0; k < 3; k++){ Sound.play('flip'); await beat(360); if (!alive()) return; }
          $('#hI').classList.remove('pumping'); $('#hC').classList.remove('pumping');
        }
        $('#hI').textContent = HANDS[last.i][0]; $('#hC').textContent = HANDS[last.c][0];
        $('#nI').textContent = HANDS[last.i][1]; $('#nC').textContent = HANDS[last.c][1];
        $('#hI').classList.add('landed'); $('#hC').classList.add('landed'); Sound.play('land');
        await beat(500); if (!alive()) return;
        $(R.w === 'irem' ? '#sdI' : '#sdC').classList.add('w'); crown(R.w);
        $('#duelRes').innerHTML = `<b>${NAMES[R.w]}</b> kazandı, onun kararı geçiyor. <span style="color:var(--soft)">${esc(R.line)}</span>`;
        Sound.play('good'); scrollEnd(rv);
      } else {
        const d = L.duel, hs = d.hist || [];
        add(`<div class="banner dis">⚔️ ${hs.length ? hs.length + ' KEZ BERABERE!' : 'ANLAŞMAZLIK!'}<small>Zarlar karar verecek: seçtiğin şeyin özelliği + 🎲</small></div>`);
        if (hs.length) add(histHTML(hs));
        Sound.play('clash');
        await beat(700); if (!alive()) return;
        add(`<div class="dicebox"><h4>Zar düellosu <span>Yüksek olan kazanır</span></h4><div class="duel">
          <div class="side irem" id="sdI"><span class="lbl">🌸 İrem</span><div class="die" id="dI">${dieHTML(1)}</div><span class="eq">${STATS[d.sti][0]} ${d.si} + 🎲 <b id="rI">?</b></span><span class="sum" id="tI">…</span></div>
          <div class="vs">VS</div>
          <div class="side cengiz" id="sdC"><span class="lbl">🌊 Cengiz</span><div class="die" id="dC">${dieHTML(1)}</div><span class="eq">${STATS[d.stc][0]} ${d.sC} + 🎲 <b id="rC">?</b></span><span class="sum" id="tC">…</span></div>
        </div><p id="duelRes" style="margin:10px 0 0;font-weight:700;font-size:14px"></p></div>`);
        Sound.play('dice');
        await Promise.all([rollDie($('#dI'), d.ri, 1000), rollDie($('#dC'), d.rc, 1150)]); if (!alive()) return;
        $('#rI').textContent = d.ri; $('#rC').textContent = d.rc; $('#tI').textContent = d.si + d.ri; $('#tC').textContent = d.sC + d.rc;
        await beat(450); if (!alive()) return;
        $(d.w === 'irem' ? '#sdI' : '#sdC').classList.add('w'); crown(d.w);
        $('#duelRes').innerHTML = `${d.tie ? 'Berabere! Şansı yüksek olan kazandı: ' : ''}<b>${NAMES[d.w]}</b> kazandı, onun kararı geçiyor. <span style="color:var(--soft)">${esc(typeof d.line === 'string' ? d.line : '')}</span>`;
        Sound.play('good'); scrollEnd(rv);
      }
    }

    if (L.check){
      await beat(700); if (!alive()) return;
      const k = L.check, max = Math.max(k.dc + 2, k.total + 1, 12);
      add(`<div class="dicebox"><h4>${STATS[k.st][0]} ${STATS[k.st][1]} kontrolü <span>${k.team ? 'Takım gücü: ' + k.base : esc(NAMES[k.who]) + ' tek başına: ' + k.base}</span></h4>
        <div class="check"><div class="die" id="dK">${dieHTML(1)}</div><div class="gauge">
          <div class="gbar"><div class="fill" id="gF"></div><div class="mark" style="left:${(k.dc / max) * 100}%"></div></div>
          <div class="gnums"><span id="gT">Güç ${k.base}</span><span>Hedef ${k.dc}</span></div></div><div id="stamp"></div></div></div>`);
      requestAnimationFrame(() => { const f = $('#gF'); if (f) f.style.width = (k.base / max) * 100 + '%'; });
      await beat(500); if (!alive()) return;
      Sound.play('dice');
      await rollDie($('#dK'), k.roll, 1000); if (!alive()) return;
      $('#gF').style.width = Math.min(100, (k.total / max) * 100) + '%';
      $('#gT').textContent = `${k.base} + 🎲${k.roll} = ${k.total}`;
      await beat(700); if (!alive()) return;
      $('#stamp').innerHTML = `<span class="stampres ${k.ok ? 'ok' : 'no'}">${k.ok ? 'BAŞARILI' : 'BAŞARISIZ'}</span>`;
      Sound.play(k.ok ? 'good' : 'bad'); scrollEnd(rv);
    }

    if (L.text){
      await beat(600); if (!alive()) return;
      const n = add(`<div class="narr"></div>`);
      await typeHTML(n, L.text); if (!alive()) return;
      scrollEnd(rv);
    }

    if (L.fx && L.fx.length){
      await beat(350); if (!alive()) return;
      const fl = add(`<div class="fxlist"></div>`);
      for (const f of L.fx){
        let cls = 'gold', txt = f.t;
        if (f.k === 'item'){ cls = f.plus ? 'plus' : 'minus'; txt = (f.plus ? 'Yeni: ' : 'Kaybedildi: ') + f.t; }
        else if (f.k === 'npc'){ cls = f.v > 0 ? 'plus' : 'minus'; txt = f.t + ' ' + (f.v > 0 ? '❤️+' + f.v : '💔' + f.v); }
        else if (f.k === 'stat'){ cls = 'gold'; txt = f.t + ' +' + f.v; }
        else if (f.k === 'uyum'){ cls = 'plus'; txt = '💞 Uyum +' + (f.v || 1); }
        else if (f.k === 'kaos'){ cls = 'minus'; txt = '🌪️ Kaos +' + (f.v || 1); }
        else if (f.k === 'ikna'){ cls = 'plus'; txt = f.t; }
        fl.insertAdjacentHTML('beforeend', `<span class="fxchip ${cls}">${esc(txt)}</span>`);
        Sound.play('chip'); scrollEnd(rv);
        await beat(140); if (!alive()) return;
      }
    }

    if (!alive()) return;
    G.fast = false;
    const toEnd = L.next === 'end';
    const nextCh = !toEnd && S[L.next] && S[L.next].ch !== sc.ch;
    $('#ab').innerHTML = `<button class="btn ${toEnd ? 'gold' : ''}" id="contBtn">${toEnd ? '🏁 Sonu gör' : nextCh ? '📖 Yeni bölüme geç ▶' : 'Devam ▶'}</button>`;
    $('#contBtn').onclick = () => { Sound.play('tap'); markSeen(P); G.view = null; decide(); };
    $('#contBtn').focus({preventScroll:true});
    scrollEnd(rv);
  })();
}

// ---------- son ----------
function viewEnding(){
  setChrome('game'); updateHUD();
  const P = G.P, E = ENDINGS[P.ending] || ENDINGS.klasik, run = G.run;
  const isNew = !LS.get('endSeen:' + P.seed, false);
  const f = foundList();
  $('#screen').innerHTML = `<div class="scroll" style="background:radial-gradient(circle at 50% 0%, #3d2a7a, var(--night) 60%)"><div class="ending" id="endc">
      <div class="medal">${E.i}</div>
      <div class="en">Son ${ENDING_ORDER.indexOf(P.ending) + 1} / ${ENDING_ORDER.length}</div>
      <h2>${esc(E.t)}</h2>
      <div class="etext" id="etext"></div>
      <div class="sumrow"><div class="sum"><b>${P.uyum}</b><span>💞 Uyum</span></div><div class="sum"><b>${P.kaos}</b><span>🌪️ Kaos</span></div><div class="sum"><b>${P.mqMatch || 0}/${P.mqTotal || 0}</b><span>🎯 Mini</span></div><div class="sum"><b>${P.log.length}</b><span>🎬 Hamle</span></div></div>
      <div id="emis"></div>
      <div id="erest" class="hidden">
        <h3>🏆 Sonlar galerisi · ${f.length}/${ENDING_ORDER.length}</h3>
        <div class="gallery">${ENDING_ORDER.map(k => f.includes(k) ? `<div class="gal on ${k === P.ending ? 'new' : ''}"><span class="e">${ENDINGS[k].i}</span>${esc(ENDINGS[k].t)}</div>` : `<div class="gal"><span class="e">❓</span><small>${esc(ENDINGS[k].h)}</small></div>`).join('')}</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px">
          <button class="btn gold" id="eNew" ${G.readOnly ? 'disabled' : ''}>🎈 Yeni macera: farklı yollar dene</button>
          <button class="btn ghost" id="eLog">🗺️ Bu yolculuğu gör</button>
        </div>
      </div>
    </div></div>`;
  const sc = $('#screen .scroll');
  sc.onclick = () => { if (G.skip) G.skip(); };
  if (isNew){ Sound.play('win'); confetti(80); }
  (async () => {
    await beat(isNew ? 900 : 0); if (run !== G.run) return;
    await typeHTML($('#etext'), E.b + `<br><br><b>Mesafe ne kadar uzak olursa olsun, ortada bir yerde buluşmaya değer.</b> 💌`);
    if (run !== G.run) return;
    const box = $('#emis');
    box.insertAdjacentHTML('beforeend', `<h3>🤫 Gizli görevler açılıyor…</h3>`);
    for (const p of PL){
      await beat(700); if (run !== G.run) return;
      const m = MISSIONS[P.missions[p]]; if (!m) continue;
      const ok = m.ok(P, p);
      box.insertAdjacentHTML('beforeend', `<div class="mreveal ${p}"><div class="av">${AV[p]}</div><div class="mt"><small>${NAMES[p]}${p === G.me ? ' (sen)' : ''} · gizli görev</small>${esc(m.t)}</div><span class="stampres ${ok ? 'ok' : 'no'}">${ok ? 'BAŞARDI' : 'OLMADI'}</span></div>`);
      Sound.play(ok ? 'good' : 'bad');
      box.lastElementChild.scrollIntoView({block:'nearest', behavior:reduced ? 'auto' : 'smooth'});
    }
    await beat(500); if (run !== G.run) return;
    $('#erest').classList.remove('hidden'); LS.set('endSeen:' + P.seed, true);
    $('#eNew').onclick = () => confirmBox('Yeni macera başlasın mı?', 'İkiniz için de yeni bir oyun başlar. Bulduğunuz sonlar galeride kalır.', startGame);
    $('#eLog').onclick = () => openSheet('yolculuk');
  })();
}

// =====================================================================
//  ALT SAYFALAR
// =====================================================================
function hearts(v){ return v > 0 ? '❤️'.repeat(Math.min(v, 5)) : v < 0 ? '💔'.repeat(Math.min(-v, 3)) : '🤍'; }
function traitOf(P, p){ const e = P.log && P.log[0]; if (!e || e.scene !== 'karakter') return null; return S.karakter.choices[p === 'irem' ? e.i : e.c]; }
const SHEETS = {
  karakter:['👤 Karakterler', () => {
    const P = G.P; if (!isGame(P)) return '';
    return PL.map(p => { const t = traitOf(P, p); return `<div class="statcard ${p}"><h4>${AV[p]} ${NAMES[p]}${p === G.me ? ' (sen)' : ''}</h4>
      ${t ? `<div class="tag" style="margin-bottom:8px">${STATS[t.st][0]} Süper güç: ${esc(t.t)}</div>` : ''}
      ${Object.keys(STATS).map(k => `<div class="srow"><span>${STATS[k][0]} ${STATS[k][1]}</span><span class="sbar"><i style="width:${(P.stats[p][k] / 8) * 100}%"></i></span><span>${P.stats[p][k]}</span></div>`).join('')}
      <div class="tag" style="margin-top:6px">⚔️ Kazanılan zar düellosu: ${P.wins[p]}</div></div>`; }).join('') +
      `<p style="font-size:13px;color:var(--soft)">Bir seçeneği seçen kişinin o özelliği +1 artar. Anlaşmazlıkta herkes kendi seçtiği şeyin özelliğiyle zar atar. Anlaşırsanız kontrollerde iki kişinin gücü toplanır.</p>`;
  }],
  canta:['🎒 Çanta', () => {
    const P = G.P; if (!isGame(P)) return '';
    return P.inv.length ? P.inv.map(i => `<div class="itemrow"><span class="ie">${ITEMS[i].e}</span><div><b>${esc(ITEMS[i].n)}</b><span>${esc(ITEMS[i].d)}</span></div></div>`).join('') + `<p style="font-size:13px;color:var(--soft)">Eşyalar ileride kilitli seçenekleri açabilir.</p>`
      : `<div class="empty">🎒<br>Çantanız boş. Maceranın ilerleyen yerlerinde işe yarar şeyler bulacaksınız.</div>`;
  }],
  dostlar:['🤝 Dostluklar', () => {
    const P = G.P; if (!isGame(P)) return '';
    const ks = Object.keys(P.npc);
    return ks.length ? ks.map(k => `<div class="itemrow"><span class="ie">${NPCS[k].e}</span><div style="flex:1"><b>${esc(NPCS[k].n)}</b><span>${esc(NPCS[k].d)}</span></div><span class="hearts">${hearts(P.npc[k])}</span></div>`).join('') + `<p style="font-size:13px;color:var(--soft)">Güçlü dostluklar zor anlarda yeni kapılar açar.</p>`
      : `<div class="empty">🤝<br>Henüz kimseyle dostluk kurmadınız.</div>`;
  }],
  gorev:['🤫 Gizli görevin', () => {
    const P = G.P; if (!isGame(P)) return '';
    const m = MISSIONS[P.missions[G.me]];
    return `<div class="missioncard"><div class="big">🤫</div><h4>Sadece sen biliyorsun</h4><p>${esc(m ? m.t : '')}</p></div>
      <p style="font-size:13.5px;color:var(--soft);margin-top:12px">${NAMES[other(G.me)]}'in de bir gizli görevi var. Görevler birbirine ters düşebilir. Oyun sonunda ikisi de açılacak. Seçimlerini buna göre yap… ya da partnerini ikna et.</p>`;
  }],
  yolculuk:['🗺️ Yolculuğunuz', () => {
    const P = G.P; if (!isGame(P)) return '';
    if (!P.log.length) return `<div class="empty">🗺️<br>Yolculuk yeni başlıyor.</div>`;
    return `<div class="timeline">${P.log.map(e => { const s = S[e.scene]; if (!s) return ''; const nm = x => esc(s.choices[x] ? s.choices[x].s : '?');
      if (e.mini) return `<div class="tl"><b>🎯 ${esc(s.title)}</b><span>Mini oyun: ${e.mm}/${e.mt} eşleşme</span></div>`;
      if (s.individual) return `<div class="tl"><b>${esc(s.title)}</b><span>İrem: ${nm(e.i)} · Cengiz: ${nm(e.c)}</span></div>`;
      const res = e.ok === true ? ' · ✅ başarılı' : e.ok === false ? ' · ❌ başarısız' : '';
      return e.i === e.c ? `<div class="tl"><b>${esc(s.title)}</b><span>💞 Birlikte: ${nm(e.i)}${res}</span></div>`
        : `<div class="tl dis"><b>${esc(s.title)}</b><span>${e.m === 'ikna' ? '🤝' : '⚔️'} İrem: ${nm(e.i)} · Cengiz: ${nm(e.c)} → ${nm(e.a)} ${e.m === 'ikna' ? '(' + NAMES[e.by] + ' ikna oldu)' : e.m === 'rps' ? '(taş-kağıt-makas)' : e.m === 'zar' ? '(zarla)' : ''}${res}</span></div>`; }).join('')}</div>`;
  }],
  galeri:['🏆 Sonlar galerisi', () => {
    const f = foundList();
    return `<p style="font-size:14px;color:var(--soft);margin-top:0">${f.length}/${ENDING_ORDER.length} son bulundu. Kilitli sonların altında küçük birer ipucu var.</p>
      <div class="gallery">${ENDING_ORDER.map(k => f.includes(k) ? `<div class="gal on"><span class="e">${ENDINGS[k].i}</span>${esc(ENDINGS[k].t)}</div>` : `<div class="gal"><span class="e">❓</span><small>${esc(ENDINGS[k].h)}</small></div>`).join('')}</div>`;
  }],
  how:['📖 Nasıl oynanır', () => `<ul class="how">
      <li><b>Her sahnede ikiniz de gizlice karar verir.</b> Bir seçenek seçip 🔒 ile kilitlersin. Partnerin karar verene kadar fikrini değiştirebilirsin.</li>
      <li><b>Aynı kararı verirseniz</b> 💞 uyum kazanırsınız ve zor işlerde iki kişinin gücü toplanır.</li>
      <li><b>Farklı karar verirseniz</b> taş-kağıt-makas oynarsınız ve kazananın kararı geçer. Ya da 🤝 partnerinin fikrine katılırsın: kaos olmaz ve iş ikinizin gücüyle yapılır. 3 kez berabere kalırsanız özellik + 🎲 zar düellosu karar verir.</li>
      <li><b>Yetenek kontrolleri:</b> 🎲 işaretli seçeneklerde başarı ya da başarısızlık sizi farklı yollara götürür. Kartta başarı olasılığı yazar.</li>
      <li><b>Strateji:</b> taş-kağıt-makası kazanan işi <i>tek başına</i> yapar, katılırsan <i>ikinizin gücü</i> toplanır. Zor işlerde katılmak bazen daha akıllıcadır.</li>
      <li><b>Mini oyunlar:</b> hikâyenin içinde "Tahmin et", "Kim daha çok?" ve "Aynı anda" turları var. Ne kadar çok eşleşirseniz o kadar avantaj kazanırsınız.</li>
      <li><b>Kasabayı Keşfet:</b> festivalden önce beş mekândan sadece üçünü gezebilirsiniz. Her mekânda başka bir şey sizi bekliyor.</li>
      <li><b>Özellikler büyür:</b> bir şeyi seçtikçe o özelliğin artar. Süper gücün baştan +2 verir.</li>
      <li><b>Eşyalar ve dostluklar</b> 🔒 kilitli seçenekleri açar. Kilidin üstünde neyin eksik olduğu yazar.</li>
      <li><b>Gizli görev:</b> 🤫 menüsünden sadece senin gördüğün görevi oku. Sonda açılır.</li>
      <li><b>17 son var.</b> Bir oyunda sahnelerin yarısını göremezsiniz. Tekrar oynayıp hepsini bulun!</li>
      <li><b>Canlı:</b> 💬 ile partnerine anlık tepki gönder ya da onu 👉 dürt.</li></ul>`],
  ayarlar:['⚙️ Ayarlar', () => `
      <div class="sec">Ses</div>
      <div class="seg"><button data-snd="1" class="${Sound.on ? 'on' : ''}">🔊 Açık</button><button data-snd="0" class="${Sound.on ? '' : 'on'}">🔇 Kapalı</button></div>
      ${window.__room ? `<div class="sec">Oda</div>
      <div class="itemrow"><span class="ie">🔑</span><div style="flex:1"><b style="font-family:var(--font-h);font-size:20px;letter-spacing:.12em">${esc(window.__room.code || '')}</b><span>Partnerin bu kodla ya da linkle katılır.</span></div></div>
      <div class="seg"><button data-act="share">📤 Linki gönder</button><button data-act="leave">🚪 Odadan çık</button></div>` : ''}
      <div class="sec">Bu cihazda oynayan</div>
      <div class="seg"><button data-me="irem" class="${G.me === 'irem' ? 'on' : ''}">🌸 İrem</button><button data-me="cengiz" class="${G.me === 'cengiz' ? 'on' : ''}">🌊 Cengiz</button></div>
      <div class="sec">Oyun</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn ghost" data-act="how">📖 Nasıl oynanır</button>
        <button class="btn ghost" data-act="galeri">🏆 Sonlar galerisi</button>
        ${isGame(G.P) ? `<button class="btn" data-act="new" ${G.readOnly ? 'disabled' : ''}>↺ Yeni macera başlat</button>` : ''}
      </div>
      ${window.__BUILD ? `<p style="text-align:center;font-size:12px;color:var(--soft);margin:16px 0 0">Sürüm ${esc(window.__BUILD)}</p>` : ''}`]
};
function openSheet(name){
  const s = SHEETS[name]; if (!s) return;
  Sound.play('tap');
  $('#sheetTitle').textContent = s[0];
  $('#sheetBody').innerHTML = s[1]();
  $('#sheet').classList.add('on');
  $('#react').classList.remove('on');
  $$('[data-snd]').forEach(b => b.onclick = () => { Sound.on = b.dataset.snd === '1'; LS.set('sound', Sound.on); if (Sound.on) Sound.play('select'); openSheet('ayarlar'); updateHUD(); });
  $$('[data-me]').forEach(b => b.onclick = () => { closeSheet(); setMe(b.dataset.me); });
  $$('[data-act]').forEach(b => b.onclick = () => {
    const a = b.dataset.act;
    if (a === 'new') confirmBox('Yeni macera başlasın mı?', 'Şu anki oyun ikiniz için de sıfırlanır. Bulduğunuz sonlar galeride kalır.', startGame);
    else if (a === 'share') window.__room.share().then(r => { if (r === 'copied') toast('Link panoya kopyalandı.'); else if (r === 'fail') toast('Oda kodu: ' + window.__room.code); });
    else if (a === 'leave') confirmBox('Odadan çıkılsın mı?', 'Oyun silinmez; aynı kodla istediğin zaman geri dönebilirsin.', () => window.__room.leave());
    else openSheet(a);
  });
  setTimeout(() => $('#sheetClose').focus({preventScroll:true}), 50);
}
function closeSheet(){ $('#sheet').classList.remove('on'); }

function confirmBox(title, text, yes){
  $('#modalTitle').textContent = title; $('#modalText').textContent = text;
  $('#modal').classList.add('on'); closeSheet();
  $('#modalNo').onclick = () => $('#modal').classList.remove('on');
  $('#modalYes').onclick = () => { $('#modal').classList.remove('on'); yes(); };
}

// =====================================================================
//  OYUN BAŞLATMA, HATALAR
// =====================================================================
async function startGame(){
  if (G.readOnly || G.starting) return;
  const seen = (G.P && typeof G.P.step === 'number') ? G.P.step : 0;
  G.starting = true; patch();
  try {
    let held = true;
    if (typeof G.ref.acquire === 'function'){
      try { const r = await G.ref.acquire({holder:G.me + '-' + Math.random().toString(36).slice(2), ttlMs:4000}); held = !!r.acquired; } catch(e){}
    }
    if (held){
      const cur = await G.ref.get();
      const d = cur.exists ? cur.data() : null;
      const fresh = isGame(d) && d.scene === 'karakter' && d.log.length === 0 && d.step > seen;
      if (!fresh){
        const prev = d ? Object.assign({}, d, {found:(d.found || G.found)}) : {found:G.found};
        await G.ref.set(newGame(prev));
      }
    } else toast('Partnerin şu an oyunu başlatıyor…');
  } catch(e){ writeErr(e); }
  G.starting = false; patch();
}
function writeErr(e){
  const code = e && e.code;
  if (code === 'invalid_argument' || code === 'revoked'){ G.readOnly = true; toast('Bu sayfada oynama iznin yok.'); G.view = null; decide(); }
  else toast('Bağlantı sorunu: hamle kaydedilemedi. Tekrar dene.');
}

// =====================================================================
//  CANLI: varlık, tepki, dürtme
// =====================================================================
function updatePresence(){
  if (!G.room || !G.me) return;
  G.room.presence({p:G.me, view:G.view || 'boot', step:isGame(G.P) ? G.P.step : 0}).catch(() => {});
}
function sendReact(e){
  if (!G.room){ toast('Canlı bağlantı yok.'); return; }
  const now = Date.now(); if (now - G.lastReact < 700) return; G.lastReact = now;
  G.room.emit('react', {e, p:G.me}).catch(() => {});
}
function sendNudge(){
  if (!G.room){ toast('Canlı bağlantı yok.'); return; }
  const now = Date.now(); if (now - G.nudgeAt < 3000){ toast('Biraz bekle 🙂'); return; } G.nudgeAt = now;
  if (!partnerPeer()) toast(NAMES[other(G.me)] + ' şu an çevrimdışı görünüyor.');
  G.room.emit('nudge', {p:G.me, to:other(G.me)}).then(() => toast('👉 ' + NAMES[other(G.me)] + ' dürtüldü!')).catch(() => {});
  $('#react').classList.remove('on');
}
const REACTS = ['❤️','😂','😱','🤔','😘','👏','🐐'];
function wireRoom(){
  const R = G.room; if (!R) return;
  R.onPeers(ch => { G.peers = ch.peers; updatePlayers(); patchPick();
    (ch.joined || []).forEach(p => { if (!p.isMe && p.presence && p.presence.p === other(G.me)) toast(`${AV[other(G.me)]} ${NAMES[other(G.me)]} oyuna katıldı!`); });
  }, () => { G.peers = []; updatePlayers(); });
  R.on('react', m => {
    const d = m.data || {}; if (!REACTS.includes(d.e)) return;
    floaty(d.e, m.sameTab ? 4 : 7); Sound.play('pop');
    if (!m.sameTab && (d.p === 'irem' || d.p === 'cengiz') && d.p !== G.me) toast(`${NAMES[d.p]}: ${d.e}`);
  });
  R.on('nudge', m => {
    const d = m.data || {}; if (m.sameTab || d.to !== G.me || (d.p !== 'irem' && d.p !== 'cengiz')) return;
    Sound.play('nudge'); const g = $('#game'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
    toast(`👉 ${NAMES[d.p]} seni dürttü!`);
  });
  R.onConnection(() => updatePresence());
}

// =====================================================================
//  BAĞLAMA VE AÇILIŞ
// =====================================================================
document.addEventListener('pointerdown', () => Sound.ensure(), {once:true});
$('#btnSound').onclick = () => { Sound.on = !Sound.on; LS.set('sound', Sound.on); if (Sound.on) Sound.play('select'); updateHUD(); };
$('#btnMenu').onclick = () => openSheet('ayarlar');
$$('#dock [data-sheet]').forEach(b => b.onclick = () => openSheet(b.dataset.sheet));
$('#btnReact').onclick = () => { Sound.play('tap'); $('#react').classList.toggle('on'); };
$$('#react [data-e]').forEach(b => b.onclick = () => sendReact(b.dataset.e));
$('#btnNudge').onclick = sendNudge;
$('#sheetClose').onclick = closeSheet;
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ closeSheet(); $('#modal').classList.remove('on'); $('#react').classList.remove('on'); }
});
document.addEventListener('click', e => { if (!e.target.closest('#react') && !e.target.closest('#btnReact')) $('#react').classList.remove('on'); });

function bootMsg(html){ $('#screen').innerHTML = `<div class="full" style="background:var(--night)">${html}</div>`; }

(async () => {
  bootMsg(`<div style="font-size:54px" class="a-bob">🎈</div><p style="color:#cfc4ea;font-weight:700">Ortanokta'ya bağlanılıyor…</p>`);
  let db = null;
  try { db = await claude.use('db'); } catch(e){ db = null; }
  if (!db){
    bootMsg(window.__STANDALONE
      ? `<div style="font-size:54px">📡</div><h2 style="font-family:var(--font-h)">Bağlantı kurulamadı</h2><p style="color:#cfc4ea">İnternet bağlantını kontrol edip uygulamayı yeniden aç.</p><button class="btn" style="flex:none;margin-top:12px" onclick="location.reload()">Tekrar dene</button>`
      : `<div style="font-size:54px">😕</div><h2 style="font-family:var(--font-h)">Oyun burada açılamıyor</h2><p style="color:#cfc4ea">Ortak oyun için sayfayı claude.ai'de giriş yapmış olarak aç.</p>`);
    return;
  }
  G.db = db;
  let user = null;
  try { user = await claude.use('user'); } catch(e){}
  G.user = user;
  if (user){
    try { if (typeof user.can === 'function'){ const w = await user.can('data.write'); if (w === false) G.readOnly = true; } } catch(e){}
  }
  // Otomatik tanıma yok: her cihaz kim olduğunu kendisi seçer (seçim bu cihazda hatırlanır)
  const saved = LS.get('who', null);
  if (saved === 'irem' || saved === 'cengiz') G.me = saved;

  G.ref = db.doc(PATH.state);
  G.vref = {irem:db.doc(PATH.vote('irem')), cengiz:db.doc(PATH.vote('cengiz'))};
  G.tref = {irem:db.doc(PATH.hand('irem')), cengiz:db.doc(PATH.hand('cengiz'))};
  G.aref = {irem:db.doc(PATH.ans('irem')), cengiz:db.doc(PATH.ans('cengiz'))};

  const slow = setTimeout(() => { if (!G.ready) bootMsg(`<div style="font-size:54px">📡</div><p style="color:#cfc4ea;font-weight:700">Bağlantı yavaş. Biraz bekle…</p>`); }, 10000);
  const check = () => {
    if (!G.ready && G.loaded.p && G.loaded.irem && G.loaded.cengiz){ G.ready = true; clearTimeout(slow); }
    if (G.ready) decide();
  };
  G.ref.onSnapshot(snap => {
    G.P = snap.exists ? snap.data() : null;
    if (isGame(G.P) && Array.isArray(G.P.found)){ G.found = G.P.found.filter(k => ENDINGS[k]); LS.set('found', G.found); }
    if (!snap.metadata.fromCache || snap.exists) G.loaded.p = true;
    check(); tryAdvance();
  }, () => { G.loaded.p = true; toast('Oyuna bağlanılamadı. Sayfayı yeniden açmayı dene.'); check(); });
  PL.forEach(p => G.vref[p].onSnapshot(snap => {
    G.V[p] = snap.exists ? snap.data() : null;
    if (!snap.metadata.fromCache || snap.exists) G.loaded[p] = true;
    check(); tryAdvance();
  }, () => { G.loaded[p] = true; check(); }));
  PL.forEach(p => G.aref[p].onSnapshot(snap => {
    G.A[p] = snap.exists ? snap.data() : null;
    if (G.ready){ if (G.view === 'mini' && p !== G.me && validAns(G.A[p]) && myAns() === null) Sound.play('turn'); decide(); }
    tryAdvance();
  }, () => {}));
  PL.forEach(p => G.tref[p].onSnapshot(snap => {
    G.T[p] = snap.exists ? snap.data() : null;
    if (G.ready){ if (G.view === 'rps' && p !== G.me && validHand(G.T[p]) && !myHand()) Sound.play('turn'); decide(); }
    tryAdvance();
  }, () => {}));

  try { G.room = await claude.use('room'); } catch(e){ G.room = null; }
  if (G.room){ wireRoom(); updatePresence(); }
})();

window.__app = {G, decide};
})();
