// api key: 
//client id: IRNzTIS0YJuJAGUE53AZxw
var apiKey = "mLgzYdES6ZMGJESWIiT0bSE_fjoQq1-1TqsNNHRyEm3yGWahTdS7oelkMQ0kiZ_WMiE7Ggepj6UkfjwHSwxyDCdGZ4aPPLGul4l5r6FaFzi9a57QZZ4SX-OBfEBUXHYx";

// GET https://api.yelp.com/v3/businesses/search

// $.get("https://api.yelp.com/v3/businesses/search?api_key="+ apiKey+ ``)

// $ curl -X POST -H "Authorization: Bearer ACCESS_TOKEN" -H "Content-Type: application/graphql" https://api.yelp.com/v3/graphql --data '
// {
//     business(id: "garaje-san-francisco") {
//         name
//         id
//         alias
//         rating
//         url
//     }
var latitude = 35.8510077;
var longitude = -78.7963109;
var term = "italian"
// var settings = {
//     "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&location=raleigh",
//     "method": "GET",
//     "timeout": 0,
//     "headers": {
//       "Authorization": "Bearer mLgzYdES6ZMGJESWIiT0bSE_fjoQq1-1TqsNNHRyEm3yGWahTdS7oelkMQ0kiZ_WMiE7Ggepj6UkfjwHSwxyDCdGZ4aPPLGul4l5r6FaFzi9a57QZZ4SX-OBfEBUXHYx"
//     },
//   };
//   $.ajax(settings).done(function (response) {
//     console.log(response);
//     console.log(response.businesses[0].alias)
//   });

  var settings = {
    "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + term + "&latitude=" + latitude + "&longitude=" + longitude,
    "method": "GET",
    "timeout": 0,
    "headers": {
      "Authorization": "Bearer mLgzYdES6ZMGJESWIiT0bSE_fjoQq1-1TqsNNHRyEm3yGWahTdS7oelkMQ0kiZ_WMiE7Ggepj6UkfjwHSwxyDCdGZ4aPPLGul4l5r6FaFzi9a57QZZ4SX-OBfEBUXHYx"
    },
  };
  $.ajax(settings).done(function (response) {
    console.log(response);
  });