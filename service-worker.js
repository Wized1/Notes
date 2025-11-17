// A version number for your cache. Update this number any time you change 
// the static files in the urlsToCache list to trigger a cache update.
const CACHE_NAME = 'notes-offline-v3.0';

// List of files to cache upon installation. This includes your HTML, 
// the inline CSS/JS (which is automatically included with index.html), 
// your manifest, and icon.
const urlsToCache = [
  '/', 
  'index.html',
  'manifest.json', // Corrected file name
  'icon.svg'
];

// --- INSTALL EVENT: Caches assets ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event triggered.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching all static assets.');
        // Note: cache.addAll will fail if any file in the list is missing.
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to pre-cache files. Check network and file names:', error);
      })
  );
});

// --- FETCH EVENT: Serves cached content ---
self.addEventListener('fetch', (event) => {
  // We only cache GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    // 1. Try to match the request in the cache
    caches.match(event.request)
      .then((response) => {
        // Cache hit: return the cached response
        if (response) {
          return response;
        }
        
        // Cache miss: fetch from the network
        return fetch(event.request);
      })
  );
});

// --- ACTIVATE EVENT: Cleans up old caches ---
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event triggered.');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache not in the whitelist (old versions)
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Takes immediate control of the page
  return self.clients.claim();
});