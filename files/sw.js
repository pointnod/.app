const CACHE_NAME = 'nod-app-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/design-rules.css',
  './css/style.css',
  './.app/App.js',
  './manifest.json'
];

// Install event: cache explicitly defined assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate event: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first, fallback to cache for offline capabilities
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
