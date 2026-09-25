// Minimaler Service-Worker: nur für PWA-Installierbarkeit (Chrome verlangt einen fetch-Handler).
// Netzwerk-First, damit immer die aktuelle Version geladen wird; kein aggressives Caching.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
