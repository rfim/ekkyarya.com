// Service worker for "Install the app" (B40, FEATURES.pwa). Network first, so a new build shows at once; what was
// fetched before stays available offline. Same-origin GET requests only. Bump VERSION to drop old caches.
const VERSION = "ekky-s6-20";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys =>
  Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  // S5: images under assets/ (Ekky's art, cut-outs, icons) don't change once published, so a repeat visit takes them
  // from the cache first. Code and data under assets/ (village.js, page.js, index.json) stay network first.
  if (/\/assets\/.+\.(png|jpe?g|webp|gif)$/i.test(new URL(r.url).pathname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("./index.html"))));
});
