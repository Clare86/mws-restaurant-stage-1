/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    /*const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;*/
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  static get Reviews_URL() {
    /*const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;*/
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews?restaurant_id=`;
  }
  /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(callback) {
  //   var dbPromise = idb.open('rdb', 1, function(upgradeDb) {
  //     upgradeDb.createObjectStore('rdb', {
  //       keyPath: 'id'
  //     });
  //   });
  //   dbPromise.then(function(db) {
  //     //console.log(db);
  //     var tx = db.transaction('rdb');
  //     var results = tx.objectStore('rdb').getAll();
  //     //console.log(results);
  //     return results;
  //   }).then(function(allObjs){ 
  //     if(allObjs.length>0){
  //       callback(null, allObjs);
  //     }else{
  //       fetch(DBHelper.DATABASE_URL, {
  //       }).then(function (response) {
  //           return response.json();
  //       }).then(function(json){
  //         var dbPromise = idb.open('rdb', 1, function(upgradeDb) {
  //           upgradeDb.createObjectStore('rdb', {
  //             keyPath: 'id'
  //           });
  //         });
  //         dbPromise.then(function(db) {
  //           var tx = db.transaction('rdb', 'readwrite');
  //           var store = tx.objectStore('rdb');
  //           json.forEach(restaurant => {
  //             store.put(restaurant);
  //           });
  //         })
  //         callback(null, json);
  //       }).catch(function(e){
  //         const error = (`Request failed. Returned status of ${e}`);
  //         callback(error, null);
  //       });
  //     }
  //   });
  // }

  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL, {
    }).then(function (response) {
        return response.json();
    }).then(function(json){
      var dbPromise = idb.open('rdb', 1, function(upgradeDb) {
        upgradeDb.createObjectStore('rdb', {
          keyPath: 'id'
        });
      });
      dbPromise.then(function(db) {
        var tx = db.transaction('rdb', 'readwrite');
        var store = tx.objectStore('rdb');
        json.forEach(restaurant => {
          store.put(restaurant);
        });
      })
      callback(null, json);
    }).catch(function(e){
      var dbPromise = idb.open('rdb', 1, function(upgradeDb) {
        upgradeDb.createObjectStore('rdb', {
          keyPath: 'id'
        });
      });
      dbPromise.then(function(db) {
        var tx = db.transaction('rdb');
        var results = tx.objectStore('rdb').getAll();
        return results;
      }).then(function(allObjs){ 
        const error = (`Request failed. Returned status of ${e}`);
        callback(error, allObjs);
      });
    });
  }

  static fetchReviews(id,callback) {
    fetch(DBHelper.Reviews_URL+id, {
    }).then(function (response) {
      return response.json();
    }).then(function(json){
      callback(null, json);
      var dbPromise = idb.open('reviews', 1, function(upgradeDb) {
        var reviewstore = upgradeDb.createObjectStore('reviews', {
          keyPath: 'id'
        });
        reviewstore.createIndex('restaurant', 'restaurant_id');
      });
      dbPromise.then(function(db) {
        var tx = db.transaction('reviews', 'readwrite');
        var store = tx.objectStore('reviews');
        json.forEach(restaurant => {
          store.put(restaurant);
        });
      })
    }).catch(function(e){
      var dbPromise = idb.open('reviews', 1, function(upgradeDb) {
        var reviewstore = upgradeDb.createObjectStore('reviews', {
          keyPath: 'id'
        });
        reviewstore.createIndex('restaurant', 'restaurant_id');
      });
      dbPromise.then(function(db) {
        var tx = db.transaction('reviews');
        var results = tx.objectStore('reviews');
        var restaurantresults = results.index('restaurant').getAll(id);
        return restaurantresults;
      }).then(function(allObjs){ 
        const error = (`Request failed. Returned status of ${e}`);
        callback(error, allObjs);
      });
    }); 
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        //console.log(restaurants);
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(photoId) {
    return (`/img/${photoId}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static postReview(params, callback){
    fetch('http://localhost:1337/reviews/', {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (result) {
        DBHelper.fetchReviews(params.restaurant_id,(error,reviews)=>{
          if(!error){
            console.log(reviews);
            var result = reviews[reviews.length-1];
            console.log(result);  
            callback(null, result);
          }
        })
      })
      .catch (function (error) {
        var dbPromise = idb.open('offline', 1, function(upgradeDb) {
          var reviewstore = upgradeDb.createObjectStore('offline',{ keyPath: "id", autoIncrement:true });
        });
        dbPromise.then(function(db) {
          var tx = db.transaction('offline', 'readwrite');
          var store = tx.objectStore('offline');
          store.add(params);
        });
        DBHelper.updateOnline(params);
        console.log('Request failed', error);
        callback("error",params)
      });
  }

  static updateOnline(params){
    var params = params;
    window.addEventListener('online', function(params) { 
      console.log("Back Online");
      var dbPromise = idb.open('offline', 1, function(upgradeDb) {
        upgradeDb.createObjectStore('offline',{ keyPath: "id", autoIncrement:true });
      });
      dbPromise.then(function(db) {
        var tx = db.transaction('offline', 'readwrite');
        var store = tx.objectStore('offline').getAll();
        return store;
      }).then(function(results){
        results.forEach(review => {
          delete review.id;
          DBHelper.postReview(review,(error,review)=>{
            if(!error){
              alert("Hello "+review.name+", Your review has been submitted.");
            }
          })
        })
      }).then(function(){
        var dbPromise = idb.open('offline', 1, function(upgradeDb) {
          upgradeDb.createObjectStore('offline',{ keyPath: "id", autoIncrement:true });
        });
        dbPromise.then(function(db) {
          var tx = db.transaction('offline', 'readwrite');
          tx.objectStore('offline').clear();
          return tx.complete;
        })
      });
    });
  }

  static updateFavourite (id,update,callback){
    fetch('http://localhost:1337/restaurants/'+id+'/?is_favorite='+update, {
      method: 'PUT'
      })
      .then(function (response) {
          return response.json();
      })
      .then(function (result) {
        callback(null,update)
      })
      .catch (function (error) {
        var error = "There was an error";
        callback(error,null)
      });
  }

}
