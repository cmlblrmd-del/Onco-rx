const CACHE_NAME = 'onco-rx-v6';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // API çağrılarını cache'leme
  if(event.request.url.includes('api.anthropic.com') ||
     event.request.url.includes('openrouter.ai')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      if(response) return response;
      return fetch(event.request).then(res => {
        if(!res || res.status !== 200 || res.type === 'opaque') return res;
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
