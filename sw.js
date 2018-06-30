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
                '/js/idb.js',
                '/js/lazysizes.min.js',
                '/css/styles-main.css',
                '/css/styles.css'
                //'/data/restaurants.json'
            ]);
        }),
    );
    event.waitUntil(
      caches.open('OpaqueCache').then(function(cache) {
        var url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBOIm7Fk8IeMSpcN1USyI-wEqxEpk8J4Ys&libraries=places&callback=initMap';
        fetch(url, {mode:'no-cors'}).then(function(response) {
            return cache.put(url, response);
        });
      })
    )
});

self.addEventListener('fetch', function(event) {
    /*console.log(event.request.url);*/
    
    var requestUrl = new URL(event.request.url);
    //console.log(requestUrl.href);

    if (requestUrl.origin === location.origin) {
      if (requestUrl.pathname.startsWith('/restaurant.html')) {
        event.respondWith(caches.match('/restaurant.html'));
        return;
      }
      if (requestUrl.pathname.startsWith('/img/')) {
        //console.log(requestUrl.href);
        event.respondWith(servePhoto(event.request));
        return;
      }
    }
    // if (requestUrl.href.startsWith("https://maps.googleapis.com/maps/api/js")) {
    //   var mapResponse = serveMap(event.request)
    //   console.log(mapResponse);
    //   event.respondWith(mapResponse);
    //   return;
    // }
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
// function serveMap(request) {
//   return fetch(request).then(function(networkResponse) {
//     return networkResponse;
//   }).catch(function(error){
//     caches.open('OpaqueCache').then(function(cache) {
//       return cache.match("/maps/api/js").then(function(response) {
//         console.log(response);
//         if (response) return response;
  
//         return fetch(request, {mode:'no-cors'}).then(function(networkResponse) {
//           cache.put("/maps/api/js", networkResponse.clone());
//           console.log(networkResponse);
//           return networkResponse;
//         });
//       });
//     });
//   });
// }

// function serveMap(request) {
//   var storageUrl = request.url;
//   console.log(storageUrl);
//   caches.open('OpaqueCache').then(function(cache) {
//     return cache.match("/maps/api/js").then(function(response) {
//       console.log(response);
//       if (response) return response;

//       return fetch(request, {mode:'no-cors'}).then(function(networkResponse) {
//         cache.put("/maps/api/js", networkResponse.clone());
//         console.log(networkResponse);
//         return networkResponse;
//       });
//     });
//   });
// }

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