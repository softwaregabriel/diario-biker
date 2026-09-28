// Diario Casal na Rota — atualização automática V1.5
const CACHE="casal-na-rota-v1.5.5-20260928";
const ASSETS=["./","./index.html","./style.css","./app.js","./cloud.js","./supabase-config.js","./manifest.json","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/rota-biker-monumento.png"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação e arquivos do aplicativo sempre tentam a versão mais recente primeiro.
  const isNavigation = event.request.mode === "navigate" || event.request.destination === "document";
  const isAppFile = /\.(js|css|json|html)$/.test(url.pathname) || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");

  if (isNavigation || isAppFile) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      }))
      .catch(() => caches.match("./index.html"))
  );
});
