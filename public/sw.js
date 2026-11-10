// Self-updating and cache-busting service worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("Purging legacy cache:", cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Do not intercept or hijack Vite module requests
self.addEventListener("fetch", (event) => {
  return;
});
