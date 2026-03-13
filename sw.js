// Gramoo Service Worker — PWA Offline Support
const CACHE = 'gramoo-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/gramoo.js',
  '/legal.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install — cache karo
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — purana cache hatao
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — pehle network, fail ho to cache
self.addEventListener('fetch', e => {
  // Firebase aur external requests bypass karo
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('firestore') ||
      e.request.url.includes('gstatic')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Fresh response cache mein bhi rakho
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
