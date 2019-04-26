(function () {
  'use strict';

  const CACHE_VERSION = 1;
  const CURRENT_CACHE = 'font-cache-v' + CACHE_VERSION;

  self.addEventListener('activate', (event) => {
    event.waitUntil(onActivate());
  });

  self.addEventListener('fetch', async (event) => {
    event.respondWith(onFetch(event));
  });

  async function onActivate() {
    const cacheNames = await caches.keys();
    const promises = cacheNames.map((cacheName) => {
      if (!CURRENT_CACHE !== cacheName) {
        console.log('Deleting out of date cache:', cacheName);
        return caches.delete(cacheName);
      }
    });
    return Promise.all(promises);
  }

  async function onFetch(event) {
    const cache = await caches.open(CURRENT_CACHE);
    const cachedRes = await cache.match(event.request);
    if (cachedRes) {
      console.log('Cached response retrieved for:', event.request.url);
      return cachedRes;
    }
    const networkRes = await fetch(event.request);
    if (networkRes.ok) {
      cache.put(event.request, networkRes.clone());
    }
    return networkRes;
  }
})();
