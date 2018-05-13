/*importScripts('/js/cache-polyfill.js');*/

self.addEventListener('install', function(event) {
    console.log("one");
    event.waitUntil(
        caches.open('restaurants').then(function(cache) {
            console.log("two");
            return cache.addAll([
                '/',
                '/index.html',
                '/restaurant.html',
                '/js/main.js',
                '/js/dbhelper.js',
                '/js/restaurant_info.js',
                '/css/styles.css',
                '/data/restaurants.json'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    /*console.log(event.request.url);*/
    
    var requestUrl = new URL(event.request.url);
    console.log(requestUrl.href);

    if (requestUrl.origin === location.origin) {
      if (requestUrl.pathname.startsWith('/restaurant.html')) {
        event.respondWith(caches.match('/restaurant.html'));
        return;
      }
      if (requestUrl.pathname.startsWith('/img/')) {
        event.respondWith(servePhoto(event.request));
        return;
      }
    }
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

function servePhoto(request) {
  var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  return caches.open("content-imgs").then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

/*self.addEventListener('install', function(event) {
  // TODO: cache /skeleton rather than the root page
  console.log("installing");
  event.waitUntil(
    caches.open('restaurants-2').then(function(cache) {
      return cache.addAll([
        '/',
        'js/main.js',
        'css/styles.css',
        'data/restaurants.json'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.delete('restaurants-1')
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });*/