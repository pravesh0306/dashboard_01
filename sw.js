// Service Worker for cache management - Mobile Optimized Green Theme
const CACHE_NAME = 'gdrive-dashboard-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/public/index.html',
  '/public/css/main.css',
  '/public/css/dashboard.css',
  '/public/css/mobile.css',
  '/public/js/app.js',
  '/public/js/data.js',
  '/public/js/utils.js',
  '/google-drive-storage.js',
  '/extension-conflict-handler.js',
  '/public/components/navigation.js',
  '/public/components/mobile-menu.js'
];

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

