/* GESTO! — Service Worker
 * Estratégia:
 *  - install pré-cacheia apenas o shell crítico (HTML/CSS/JS/manifest).
 *  - assets pesados de áudio (WAV/MP3) entram no cache sob demanda no fetch handler.
 *  - fetch: stale-while-revalidate (retorna cache rápido, atualiza em background) para mesma origem.
 */
const VERSION = 'gesto-v2.1.0';

// Shell crítico (~140KB). Falha = SW não instala — força lista mínima.
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './categories.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[SW] Falhou pré-cache core:', err);
      })
    )
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
  const url = new URL(req.url);
  // Mesma origem apenas — fontes do Google passam direto
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(req).then((cached) => {
        // Stale-while-revalidate: devolve cache se houver, atualiza em background
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              cache.put(req, res.clone()).catch(() => {});
            }
            return res;
          })
          .catch(() => null);

        // Se tem em cache, devolve já (e atualiza em paralelo)
        if (cached) {
          fetchPromise; // fire-and-forget
          return cached;
        }
        // Senão, espera a rede
        return fetchPromise.then((res) => res || caches.match('./index.html'));
      })
    )
  );
});
