(function () {
  'use strict';

  importScripts(
    './api-url.js',
    './sw/utils.js',
    './sw/store.js',
    // './sw/cache.js',
    './sw/push.js',
    './sw/sync.js',
  );

  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    self.clients.claim();
  });
})();
