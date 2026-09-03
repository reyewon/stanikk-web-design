/* Kombu Web Design — minimal service worker.
   Required by Android Chrome's installability check (iOS allows
   "Add to Home Screen" without a SW). Uses a network-first strategy
   with a tiny cache so offline reloads still surface the home page. */

const CACHE_NAME = 'kombu-v2';
const OFFLINE_URLS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GETs from this origin; everything else passes through.
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful navigations + manifest for offline fallback.
        // waitUntil keeps the worker alive for the write: without it the
        // browser can kill the worker once the response is returned and the
        // page never actually lands in the cache.
        if (response && response.status === 200 && (event.request.mode === 'navigate' || url.pathname === '/manifest.webmanifest')) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/')))
  );
});
