const CACHE = 'shop-debts-v13';
const CORE = './index.html';
const ASSETS = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './logo-star.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      // Cache the app shell itself first and treat it as must-succeed —
      // this is the one file offline opening truly depends on.
      try { await c.add(CORE); } catch(err) {}
      // Everything else is best-effort: if one file 404s or is missing on
      // the host, that must NOT wipe out the rest of the cache (this is
      // exactly what cache.addAll's all-or-nothing behavior used to do).
      await Promise.all(ASSETS.map(url => c.add(url).catch(()=>{})));
    }).then(() => self.skipWaiting())
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

  // Page loads/navigations: serve the cached app shell INSTANTLY (cache-first)
  // instead of waiting on the network. This is what makes the app open fast
  // and reliably every time, even on a slow or flaky connection — no waiting
  // to find out the network is bad before falling back. We still refresh the
  // cached copy quietly in the background whenever a connection is available,
  // so you get the latest version next time you open it.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(CORE).then(cached => {
        const network = fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => { c.put(CORE, clone); c.put(e.request, res.clone()); });
          return res;
        }).catch(() => undefined);
        if (cached) {
          network; // refresh in background, ignore the result here
          return cached;
        }
        return network.then(res => res || caches.match('./'));
      })
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
