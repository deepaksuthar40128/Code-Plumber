const CACHE_NAME = 'code-plumber';

const staticAssets = [
    '/c.png',
    '/cpp.png',
    '/html.png',
    '/java.png',
    '/python.png'
];

setInterval(() => {
    caches.keys().then((cacheNames) => {
        return Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            })
        );
    });
}, 24 * 60 * 60 * 1000);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(staticAssets);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/) || url.pathname.match(/\.(woff|woff2|eot|ttf|otf)$/)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                }).catch(() => {
                    return caches.match('/offline.html');
                });
            })
        )
    }
    else {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match('/offline.html');
            }));
    }
});