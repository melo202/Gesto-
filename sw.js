/* GESTO! — Service Worker simples
 * Estratégia: pré-cache no install + network-first com fallback offline ao cache.
 * Funciona em GitHub Pages (escopo relativo).
 */
const VERSION = 'gesto-v1.6.1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './categories.js',
  './manifest.webmanifest',
  './Brass Flag Win.wav',
  './Clockfruit Panic.wav',
  './Fail Accordion.wav',
  './Neon Gavel.wav',
  './ROUND ONE FIGHT.wav',
  './Lounge Loop.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Apenas mesma origem
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Atualiza cache em background
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(req, copy).catch(() => {}));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
