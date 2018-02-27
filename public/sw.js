const CACHE_STATIC_NAME = 'static';
const CACHE_STATIC_VERSION = 'v7';

const CACHE_DYNAMIC_NAME = 'dynamic';
const CACHE_DYNAMIC_VERSION = 'v3';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

function getStaticCacheName() {
  return `${CACHE_STATIC_NAME}-${CACHE_STATIC_VERSION}`;
}

function getDynamicCacheName() {
  return `${CACHE_DYNAMIC_NAME}-${CACHE_DYNAMIC_VERSION}`;
}

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(getStaticCacheName()).then((cache) => {
      console.log('[Service Worker] Precaching App Shell');
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== getStaticCacheName() && key !== getDynamicCacheName()) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// cache with network fallback strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then((res) => {
//             return caches.open(getDynamicCacheName()).then((cache) => {
//               cache.put(event.request.url, res.clone());
//               return res.clone();
//             });
//           })
//           .catch((err) => {
//             return caches.open(getStaticCacheName()).then((cache) => {
//               return cache.match('/offline.html');
//             });
//           });
//       }
//     })
//   );
// });

// cache only strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(caches.match(event.request));
// });

// network only strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(fetch(event.request));
// });

// network with cache fallback strategy
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         return caches.open(getDynamicCacheName()).then((cache) => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch((err) => {
//         return caches.match(event.request);
//       })
//   );
// });

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    // console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

// cache then network strategy
self.addEventListener('fetch', (event) => {
  const url = 'https://httpbin.org/get';

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(getDynamicCacheName()).then((cache) => {
        return fetch(event.request).then((res) => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    self.addEventListener('fetch', function(event) {
      event.respondWith(caches.match(event.request));
    });
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              return caches.open(getDynamicCacheName()).then((cache) => {
                cache.put(event.request.url, res.clone());
                return res.clone();
              });
            })
            .catch((err) => {
              return caches.open(getStaticCacheName()).then((cache) => {
                if (event.request.url.indexOf('/help')) {
                  return cache.match('/offline.html');
                }
              });
            });
        }
      })
    );
  }
});
