let restaurant;
var map;

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js').then(function() {
    console.log('Registration worked!');
  }).catch(function() {
    console.log('Registration failed!');
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favourite = document.getElementById('favourite');
  var isFavourite = restaurant.is_favorite;
  console.log(isFavourite);
  if (isFavourite === "true") {
    favourite.className = "f_true";
    favourite.innerHTML = "In Favourites!"
  } else {
    favourite.className = "f_false";
    favourite.innerHTML = "Favourite Me!"
  }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  var photoId = restaurant.photograph;
  if (!photoId) {
    photoId = "10";
  }

  const imageMedium = document.getElementById('medium-restaurant-img');
  imageMedium.srcset = DBHelper.imageUrlForRestaurant(photoId)+"-1600_medium.jpg";

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(photoId)+"-600_small.jpg";
  image.alt = "Photo of "+restaurant.name+" restaurant";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviews(restaurant.id, (error, reviews) => {
    self.reviews = reviews;
    if (!reviews) {
      console.error(error);
      return;
    }
    fillReviewsHTML();
  });
  
  const idElement = document.getElementById('restaurant-id');
  idElement.value = restaurant.id;
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  console.log(reviews);
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create add review form.
 */

document.getElementById("review-form").addEventListener("submit", function(event){
  event.preventDefault()
  console.log("Button Pressed");
  var username = document.getElementById('user-name').value;
  var restaurantId = document.getElementById('restaurant-id').value;
  var rating = document.getElementById('rating').value;
  var comments = document.getElementById('comments').value;
  var params = {
    "restaurant_id": parseInt(restaurantId),
    "name": username,
    "rating": rating,
    "comments": comments
  };
  DBHelper.postReview(params,(error,review)=>{
    if (error) {
      alert("You are offline. An attempt to submit your review to the server will be made when you are back online.");
    }
    const ul = document.getElementById('reviews-list');
    ul.appendChild(createReviewHTML(review));
    document.getElementById('user-name').value = "";
    document.getElementById('rating').value = "1";
    document.getElementById('comments').value = "";
  });
});

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');

  const div = document.createElement('div');
  li.appendChild(div);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  div.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  div.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

document.getElementById("favourite").addEventListener("click", function(){
  const id = getParameterByName('id');
  var element = document.getElementById("favourite");
  var f_class = element.className;
  console.log(f_class);
  if (f_class === "f_false") {
    update = "true";
  } else if (f_class === "f_true") {
    update = "false"
  }
  console.log(update);
  DBHelper.updateFavourite(id,update,(error,update)=>{
    if (error) {
      alert("You are offline. Please try again later.");
    } else {
      if (update === "true"){
        element.className = "f_true";
        element.innerHTML = "In Favourites!"
      } else {
        element.className = "f_false";
        element.innerHTML = "Favourite Me!"
      }
    }
  });
})

// document.getElementById("show-map").addEventListener("click", function(){
//   var element = document.getElementById("map-container");
//   element.innerHTML = '<div id="map" role="application" aria-label="Restaurants map"></div>';
// })
