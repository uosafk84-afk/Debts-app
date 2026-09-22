const CACHE = 'shop-debts-v5';
const ASSETS = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo-star.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(()=>{})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Page loads/navigations: always guarantee the app opens offline by falling
  // back to the cached index.html no matter what URL was actually requested
  // (this is what makes "open with no internet" work reliably).
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => { caches.open(CACHE).then(c => c.put('./index.html', res.clone())); return res; })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Everything else (icons, manifest, the logo, CDN libs): serve from cache
  // instantly if we have it, and refresh the cache quietly in the background
  // when online, so it still works offline.
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
