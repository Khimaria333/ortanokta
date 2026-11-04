// =====================================================================
//  ORTANOKTA MACERASI · BAĞIMSIZ SÜRÜM ARA KATMANI
//  Oyunun beklediği claude.use('db' | 'room' | 'user') arayüzünü
//  Firebase Firestore üzerinde, bir "oda kodu" altında sağlar.
// =====================================================================
(() => {
'use strict';
window.__STANDALONE = true;
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const ROOM_RE = /^[A-Z0-9]{4,12}$/;
const LSK = 'ortanokta:room';
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const tabId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const HEARTBEAT = 15000, STALE = 45000;
const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const $ = s => document.querySelector(s);

let code = null, fs = null, fsPromise = null;
let roomResolve; const roomReady = new Promise(r => { roomResolve = r; });

// ---------- Firestore yükleyici ----------
function loadFS(){
  if (fsPromise) return fsPromise;
  fsPromise = (async () => {
    if (window.__FAKE_FS) return window.__FAKE_FS; // testler için
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.projectId) throw new Error('Firebase ayarı eksik');
    const [{initializeApp}, F] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-firestore.js')]);
    const app = initializeApp(cfg);
    const db = F.getFirestore(app);
    const wrap = s => ({exists:s.exists(), data:s.exists() ? s.data() : undefined, fromCache:s.metadata.fromCache, pending:s.metadata.hasPendingWrites});
    return {
      set:(p, d) => F.setDoc(F.doc(db, p), d),
      get:async p => wrap(await F.getDoc(F.doc(db, p))),
      del:p => F.deleteDoc(F.doc(db, p)),
      listen:(p, next, err) => F.onSnapshot(F.doc(db, p), s => next(wrap(s)), err),
      listenCol:(p, next, err) => F.onSnapshot(F.collection(db, p), qs => next(qs.docs.map(d => ({id:d.id, data:d.data()}))), err)
    };
  })();
  return fsPromise;
}

const full = p => `rooms/${code}/${p}`;
const plain = d => JSON.parse(JSON.stringify(d));
const mapErr = e => ({code:'unavailable', message:String(e && e.message || e)});
const snapFor = s => ({exists:!!s.exists, data:() => s.data, metadata:{fromCache:!!s.fromCache, hasPendingWrites:!!s.pending}});

// ---------- db ----------
const dbApi = {
  doc(path){
    const p = full(path);
    return {
      path,
      set:d => fs.set(p, plain(d)).catch(e => { throw mapErr(e); }),
      get:async () => snapFor(await fs.get(p)),
      acquire:async () => ({acquired:true}),
      onSnapshot:(next, err) => fs.listen(p, s => next(snapFor(s)), e => err && err(mapErr(e)))
    };
  }
};

// ---------- oda (çevrimiçi durumu + anlık olaylar) ----------
let me = {}, peers = [], peerFns = [], rawPeers = [], prevIds = new Set(), hbTimer = null, writeTimer = null;
function peerList(){
  const now = Date.now();
  return rawPeers.filter(x => x.data && now - (x.data.t || 0) < STALE).map(x => ({
    peer:x.id, by:null, presence:x.data.s || {}, sameTab:x.id === tabId, isMe:x.id === tabId, kind:'viewer', guest:false, updatedAt:x.data.t || 0
  }));
}
function emitPeers(){
  peers = peerList();
  const ids = new Set(peers.map(p => p.peer));
  const joined = peers.filter(p => !prevIds.has(p.peer)), left = [...prevIds].filter(id => !ids.has(id)).map(id => ({peer:id}));
  prevIds = ids;
  peerFns.forEach(fn => { try { fn({peers, joined, left, updated:[]}); } catch(e){} });
}
function writePresence(){
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => { fs.set(full('presence/' + tabId), {s:plain(me), t:Date.now()}).catch(() => {}); }, 250);
}
const topicFns = {};
let lastSeenEvt = {};
const roomApi = {
  presence:async patch => { Object.entries(patch).forEach(([k, v]) => { if (v === null) delete me[k]; else me[k] = v; }); writePresence(); },
  onPeers:fn => { peerFns.push(fn); setTimeout(() => fn({peers, joined:peers, left:[], updated:[]}), 0); return () => { peerFns = peerFns.filter(f => f !== fn); }; },
  peers:() => peers,
  emit:async (topic, data) => { await fs.set(full('events/' + topic), {data:plain(data === undefined ? null : data), t:Date.now(), from:tabId, n:Math.random()}); },
  on:(topic, fn) => {
    (topicFns[topic] = topicFns[topic] || []).push(fn);
    if (topicFns[topic].length === 1){
      let first = true;
      fs.listen(full('events/' + topic), s => {
        if (first){ first = false; if (s.data) lastSeenEvt[topic] = s.data.n; return; }
        const d = s.data; if (!d || d.n === lastSeenEvt[topic] || Date.now() - d.t > 15000) return;
        lastSeenEvt[topic] = d.n;
        const msg = {topic, data:d.data, peer:d.from, by:null, isMe:d.from === tabId, sameTab:d.from === tabId, kind:'viewer', guest:false};
        (topicFns[topic] || []).forEach(f => { try { f(msg); } catch(e){} });
      }, () => {});
    }
    return () => { topicFns[topic] = (topicFns[topic] || []).filter(f => f !== fn); };
  },
  onConnection:fn => { setTimeout(() => fn(navigator.onLine !== false), 0); const on = () => fn(true), off = () => fn(false); addEventListener('online', on); addEventListener('offline', off); return () => { removeEventListener('online', on); removeEventListener('offline', off); }; },
  connected:() => navigator.onLine !== false
};
function startRoom(){
  fs.listenCol(full('presence'), docs => { rawPeers = docs; emitPeers(); }, () => {});
  hbTimer = setInterval(() => { writePresence(); emitPeers(); }, HEARTBEAT);
  const bye = () => { try { fs.del(full('presence/' + tabId)); } catch(e){} };
  addEventListener('pagehide', bye);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') writePresence(); });
}

const userApi = {isOwner:() => false, canEdit:() => true, can:async () => true, id:async () => tabId, me:async () => ({id:tabId, name:''}), profiles:async () => ({})};

// ---------- uygulama kurulumu (Android) ----------
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; const b = $('#lbInstall'); if (b) b.classList.remove('hidden'); });
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// ---------- oda bilgisi (ayarlar menüsü için) ----------
function shareUrl(){ return location.origin + location.pathname + '#' + code; }
window.__room = {
  get code(){ return code; },
  url:shareUrl,
  async share(){
    const url = shareUrl(), text = `Ortanokta Macerası'na gel! Oda kodu: ${code}`;
    try { if (navigator.share){ await navigator.share({title:'Ortanokta Macerası', text, url}); return 'shared'; } } catch(e){ if (e && e.name === 'AbortError') return 'cancel'; }
    try { await navigator.clipboard.writeText(text + '\n' + url); return 'copied'; } catch(e){ return 'fail'; }
  },
  leave(){ try { localStorage.removeItem(LSK); } catch(e){} history.replaceState(null, '', location.pathname); location.reload(); }
};

// ---------- lobi ----------
function genCode(){ let s = ''; const a = new Uint32Array(6); (crypto.getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 1e9)); a.forEach(v => s += ALPH[v % ALPH.length]); return s; }
function lobbyShell(inner){
  return `<div class="titlescreen">
    <div class="stage" aria-hidden="true"><div class="sky" style="background:linear-gradient(#ff9a8b 0%, #ffcf9f 45%, #ffe9c8 100%)"></div>
      <span class="cloud" style="top:10%;animation-duration:38s">☁️</span><span class="cloud" style="top:26%;animation-duration:52s;animation-delay:-20s">☁️</span>
      <svg class="ground" viewBox="0 0 400 100" preserveAspectRatio="none"><path d="M0 34 Q90 6 200 30 T400 24 V100 H0Z" fill="#5aa64e"/><path d="M0 58 Q120 30 230 54 T400 50 V100 H0Z" fill="#7cc46a"/></svg>
      <span class="prop" style="left:14%;top:90%;font-size:46px">🏘️</span><span class="prop a-rise" style="left:72%;top:56%;font-size:84px">🎈</span>
      <span class="prop a-bob" style="left:34%;top:92%;font-size:46px">🐐</span><span class="prop" style="left:90%;top:88%;font-size:46px">🌳</span>
      <div class="vignette"></div></div>
    <div class="logo"><h1>Ortanokta<br><em>Macerası</em></h1><p>İrem & Cengiz</p></div>
    <div class="menu" id="lobby">${inner}</div></div>`;
}
function installHTML(){
  if (isStandalone()) return '';
  if (isIOS()) return `<p class="sub" style="margin:0;font-size:12.5px">📲 iPhone'da uygulama gibi kullanmak için: Safari'de <b>Paylaş ⬆️</b> → <b>Ana Ekrana Ekle</b></p>`;
  return `<button class="btn ghost small ${installEvt ? '' : 'hidden'}" id="lbInstall" style="flex:none">📲 Uygulamayı telefona yükle</button>`;
}
function bindInstall(){ const b = $('#lbInstall'); if (b) b.onclick = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch(e){} installEvt = null; b.classList.add('hidden'); }; }
function showLobby(msg){
  const screen = $('#screen');
  screen.innerHTML = lobbyShell(`
    <div class="welcome">Oyun odası</div>
    <div class="sub">İkiniz aynı odaya girince oyun iki telefonda birden oynanır.</div>
    ${msg ? `<div class="notice" style="margin:0">${esc(msg)}</div>` : ''}
    <button class="btn" id="lbNew">🎈 Yeni oda kur</button>
    <button class="btn teal" id="lbJoin">🔑 Koda katıl</button>
    ${installHTML()}`);
  $('#lbNew').onclick = () => showCreated(genCode());
  $('#lbJoin').onclick = () => showJoin();
  bindInstall();
}
function showCreated(c){
  $('#lobby').innerHTML = `
    <div class="welcome">Odanız hazır!</div>
    <div class="sub">Bu kodu ya da linki partnerine gönder.</div>
    <div class="roomcode" aria-label="Oda kodu">${esc(c)}</div>
    <button class="btn violet" id="lbShare">📤 Linki gönder</button>
    <button class="btn" id="lbEnter">▶ Odaya gir</button>
    <button class="btn ghost small" id="lbBack" style="flex:none">← Geri</button>
    <p class="sub" id="lbNote" style="margin:0;font-size:12.5px"></p>`;
  code = c;
  $('#lbShare').onclick = async () => { const r = await window.__room.share(); $('#lbNote').textContent = r === 'copied' ? 'Link panoya kopyalandı. Mesajla gönderebilirsin.' : r === 'fail' ? `Kodu elle gönder: ${c}` : ''; };
  $('#lbEnter').onclick = () => enter(c);
  $('#lbBack').onclick = () => { code = null; showLobby(); };
}
function showJoin(){
  $('#lobby').innerHTML = `
    <div class="welcome">Koda katıl</div>
    <div class="sub">Partnerinin gönderdiği oda kodunu yaz.</div>
    <input id="lbCode" class="codeinput" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ÖRN. K7Q2MX" inputmode="text">
    <button class="btn teal" id="lbGo" disabled>Katıl ▶</button>
    <button class="btn ghost small" id="lbBack" style="flex:none">← Geri</button>`;
  const inp = $('#lbCode'), go = $('#lbGo');
  const norm = v => v.toLocaleUpperCase('en-US').replace(/İ/g, 'I').replace(/[^A-Z0-9]/g, '').slice(0, 12);
  inp.oninput = () => { const v = norm(inp.value); if (inp.value !== v) inp.value = v; go.disabled = !ROOM_RE.test(v); };
  inp.onkeydown = e => { if (e.key === 'Enter' && !go.disabled) go.click(); };
  go.onclick = () => enter(norm(inp.value));
  $('#lbBack').onclick = () => showLobby();
  setTimeout(() => inp.focus(), 50);
}
function enter(c){
  if (!ROOM_RE.test(c)) return;
  code = c;
  try { localStorage.setItem(LSK, c); } catch(e){}
  history.replaceState(null, '', location.pathname + '#' + c);
  $('#screen').innerHTML = `<div class="full" style="background:var(--night)"><div style="font-size:54px" class="a-bob">🎈</div><p style="color:#cfc4ea;font-weight:700">${esc(c)} odasına bağlanılıyor…</p></div>`;
  roomResolve(c);
}

// ---------- başlat ----------
function pickInitial(){
  const h = (location.hash || '').replace('#', '').toUpperCase();
  if (ROOM_RE.test(h)) return h;
  try { const s = localStorage.getItem(LSK); if (ROOM_RE.test(s || '')) return s; } catch(e){}
  return null;
}
let booted = null;
function boot(){
  if (booted) return booted;
  booted = (async () => {
    const pre = pickInitial();
    if (pre) enter(pre);
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => showLobby(), {once:true});
    else showLobby();
    await roomReady;
    try { fs = await loadFS(); } catch(e){ fs = null; return false; }
    startRoom();
    return true;
  })();
  return booted;
}

window.claude = {
  use:async name => {
    const ok = await boot();
    if (!ok) return null;
    if (name === 'db') return dbApi;
    if (name === 'room') return roomApi;
    if (name === 'user') return userApi;
    return null;
  }
};

// ---------- service worker ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
