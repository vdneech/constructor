// public/service-worker.js

const CACHE_NAME = 'gfs-admin-v2'; // ← Увеличьте версию для сброса старого кеша
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/logo 512x512.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Кеширование статических файлов');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Ошибка кеширования:', err);
      });
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаление старого кеша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first для API, cache-first для статики
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API запросы — ВСЕГДА только из сети, НЕ кешируем
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Нет соединения' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Для остальных файлов (HTML, JS, CSS, изображения) — cache-first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Асинхронно обновляем кеш в фоне
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
        });
        return cachedResponse;
      }

      // Если в кеше нет — загружаем из сети
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Кешируем только статику (не HTML страницы с данными)
        if (request.method === 'GET' && !url.pathname.includes('/api/')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});
