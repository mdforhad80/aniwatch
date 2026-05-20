// ============================================
// SERVICE WORKER - AnimeVault
// ============================================

const CACHE_NAME = 'animevault-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/anime.html',
    '/watch.html',
    '/search.html',
    '/profile.html',
    '/schedule.html',
    '/login.html',
    '/signup.html',
    '/creator.html',
    '/assets/css/main.css',
    '/assets/css/components.css',
    '/assets/css/player.css',
    '/assets/css/auth.css',
    '/manifest.json'
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Cache strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API requests - Network first, cache fallback
    if (url.hostname === 'api.jikan.moe') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static assets - Cache first
    if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((cached) => {
                return cached || fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // HTML pages - Network first
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
