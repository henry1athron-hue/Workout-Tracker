const CACHE_NAME = 'workout-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
.log-header {
    cursor: pointer;
    padding: 5px 0;
}

.log-details {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #444;
    font-size: 0.85rem;
    color: #bbb;
}

.ex-detail {
    margin-bottom: 8px;
    background: #252525;
    padding: 5px;
    border-radius: 4px;
}
