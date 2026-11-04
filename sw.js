// Ortanokta Macerası · çevrimdışı açılış için önbellek (önce ağ, sonra önbellek)
const CACHE = 'ortanokta-v9';
const V = '?v=9';
const SHELL = ['./', 'index.html', 'style.css' + V, 'standalone.css' + V, 'config.js' + V, 'shim.js' + V, 'questions.js' + V, 'story.js' + V, 'engine.js' + V, 'app.js' + V, 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache:'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('firestore.googleapis.com') || url.hostname.includes('googleapis.com') && url.pathname.includes('/google.firestore')) return;
  e.respondWith(fetch(req, url.origin === location.origin ? {cache:'no-cache'} : undefined).then(res => {
    if (res && (res.ok || res.type === 'opaque')){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
