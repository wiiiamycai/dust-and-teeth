// The offline app (v7.0): keeps a copy of every file, so the game opens instantly from the home screen and works
// with no signal. The page itself is always fetched fresh when there is signal, and every script carries ?v= of
// its version, so a new build arrives on its own.
const CACHE = 'dust-teeth-v9.33';
self.addEventListener('install', e => {
  e.waitUntil(
    (async () => {
      const c = await caches.open(CACHE);
      const html = await (await fetch('./index.html', { cache: 'no-store' })).text();
      const files = ['./', './index.html', ...[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => './' + m[1])];
      await c.addAll([...new Set(files)]);
      self.skipWaiting();
    })(),
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // the page: fresh when online, the saved copy when not
  if (r.mode === 'navigate' || r.url.endsWith('/index.html')) {
    e.respondWith(
      fetch(r)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }
  // everything else: the saved copy first, the network if it's new
  e.respondWith(
    caches.match(r).then(
      hit =>
        hit ||
        fetch(r).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(r, copy));
          return res;
        }),
    ),
  );
});
