var venues = [];

function yelpAPICall(restaurantType, requestedTime, userLatitude, userLongitude) {
    gotRestaurantData = true;
    var settings = {
        "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + restaurantType + "&latitude=" + userLatitude + "&longitude=" + userLongitude + "&open_at=" + requestedTime + "&limit=10",
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": "Bearer mLgzYdES6ZMGJESWIiT0bSE_fjoQq1-1TqsNNHRyEm3yGWahTdS7oelkMQ0kiZ_WMiE7Ggepj6UkfjwHSwxyDCdGZ4aPPLGul4l5r6FaFzi9a57QZZ4SX-OBfEBUXHYx"
        },
    };
    $.ajax(settings).done(function (response) {
        gotRestaurantData = true;
        addRestaurants(response.businesses)
    });
}

function addRestaurants(restaurantArray) {//TODO: is this an intentional abbreviation?
    for (var i = 0; i < restaurantArray.length; i++) {
        var restaurant = restaurantArray[i];
        var newImage = $("<img src=" + restaurant.image_url + ">");
        newImage.addClass("restaurant-pic");
        var newRow = $("<tr>");
        newRow.attr("data-longitude", restaurant.coordinates.longitude);
        newRow.attr("data-latitude", restaurant.coordinates.latitude);
        newRow.addClass("restaurant-row");
        var nameColumn = $("<td>").text(restaurant.name);
        nameColumn.addClass("restaurant-name");
        var descriptionColumn = $("<td>").text(restaurant.rating);
        var priceColumn = $("<td>").text(restaurant.price);
        var imageColumn = $("<td>").html(newImage);
        newRow.append(imageColumn, nameColumn, descriptionColumn, priceColumn);
        $("#restaurant-table").append(newRow);
        //push restaurant info to venues array for putting on map
        venues.push([restaurant.name, restaurant.coordinates.latitude,restaurant.coordinates.longitude]);
    }
}