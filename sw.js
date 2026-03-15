// Gramoo Service Worker — PWA Offline Support
const CACHE = 'gramoo-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/guide-user.html',
  '/guide-shopkeeper.html',
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

// Fetch — POST requests aur non-GET skip karo (Cache API sirf GET support karta hai)
self.addEventListener('fetch', e => {

  // ✅ Fix: Sirf GET requests cache karo — POST/PUT/DELETE skip
  if (e.request.method !== 'GET') return;

  // Firebase, ElevenLabs aur external APIs bypass karo
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('firestore') ||
      e.request.url.includes('gstatic') ||
      e.request.url.includes('elevenlabs') ||
      e.request.url.includes('api.')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Sirf valid responses cache karo
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
