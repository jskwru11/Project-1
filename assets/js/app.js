console.log("v1.358"); //this is updated so you can see when GitHub has actually deployed your code. This is necessary for testing stuff with CORS limitations (like Google Maps)

var map;
var userLatitude;
var userLongitude;
var initMapLatLong;
var gotRestaurantData = true;
var service;
var infowindow;
var request;
var movieTheaterNames;
var userIdentificationPath;
var userCoordinatesPath;
var userPreferencesPath;
var userRestaurantPath;

//#region - firebase authentication
var config = {
    apiKey: "AIzaSyDJjHXFsfWA5UNS_7-aWWB0IUt7pTEXr7E",
    authDomain: "dsm-group-project-1.firebaseapp.com",
    databaseURL: "https://dsm-group-project-1.firebaseio.com",
    projectId: "dsm-group-project-1",
    storageBucket: "dsm-group-project-1.appspot.com",
    messagingSenderId: "729543680357"
};
firebase.initializeApp(config);

var database = firebase.database();
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
//#endregion

function initMap() {
    if (userLatitude != undefined && userLongitude != undefined) {
        setTimeout(function () {
            console.log("init map: " + userLatitude, userLongitude);
            initMapLatLong = userLatitude, userLongitude;
            let userLatLong = { lat: userLatitude, lng: userLongitude };
            let zoom = 16
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: zoom,
                center: userLatLong
            });

            let todaysDate = new Date().toLocaleDateString("en-US");
            let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            database.ref(userCoordinatesPath).set({
                dateTime: todaysDate + " " + currentTime,
                currentLat: userLatitude,
                currentLong: userLongitude,
            });
        }, 500);
    };
}

$(document).ready(function () {
    //#region - geolocation
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            console.log("Geolocation is not supported by this browser");
        }
    }

    function showPosition(position) {
        userLatitude = parseFloat(position.coords.latitude);
        userLongitude = parseFloat(position.coords.longitude);
        if (initMapLatLong != userLatitude, userLongitude) {
            console.log("redoing initMap: " + initMapLatLong + " / " + userLatitude, userLongitude);
            initMap();
        }
    }

    function getLatLongFromVenueName(movieTheaterNames) {
        // TODO: the following line is SAMPLE DATA
        movieTheaterNames = ["theater 1 name", "theater 2 name", "theater 3 name"];

        for (let i = 0; i < movieTheaterNames.length; i++) {
            request = {
                query: movieTheaterNames[i],
                fields: ["name", "geometry"],
            };
            service = new google.maps.places.PlacesService(map);

            service.findPlaceFromQuery(request, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        placeComplexMarker(results[i].geometry.location, results[i].name, "movie", "single");
                    };
                };
            });
        };
    };
    //#endregion

    //#region - markers
    var venues = [];
    //see https://developers.google.com/maps/documentation/javascript/examples/icon-complex

    // Origins, anchor positions and coordinates of the marker increase in the X
    // direction to the right and in the Y direction down.
    var imageRestaurant = {};
    var imageMovie = {};
    var imageUser = {};
    setTimeout(function () { // this is a workaround for "Uncaught ReferenceError: google is not defined"
        imageRestaurant = {//TODO: one image for restaurants, another for movies
            url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(20, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32)
        };
        imageMovie = {//TODO: one image for restaurants, another for movies
            url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(20, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32)
        };

        imageUser = {//TODO: one image for restaurants, another for movies
            url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(20, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32)
        };
    }, 5000);

    //TODO: SAMPLE DATA - this array will be constructed on the fly
    //each time multiple markers need to be set down. the following is
    //sample data and should be deleted for production.
    venues = [
        ["Cocina Desmond", 35.8296462, -79.1090949, 1],
        ["Willie's BBQ", 35.83, -79.11, 1],
    ];

    function placeMarker(theLatLong, title) { //this is the simple version
        //which we may not use
        var marker = new google.maps.Marker({
            position: theLatLong,
            map: map,
            title: title
        });
    }

    function placeComplexMarker(theLatLong, title, restaurantOrMovie, singleOrMultiple, venues) {//see https://developers.google.com/maps/documentation/javascript/examples/icon-complex
        // Marker sizes are expressed as a Size of X,Y where the origin of the image
        // (0,0) is located in the top left of the image.

        // Shapes define the clickable region of the icon. The type defines an HTML
        // <area> element 'poly' which traces out a polygon as a series of X,Y points.
        // The final coordinate closes the poly by connecting to the first coordinate.
        var shape = {//TODO: question - hard-wire a single shape? use no shape?
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };

        if (restaurantOrMovie = "restaurant") {
            var image = imageRestaurant;
        } else {
            if (restaurantOrMovie = "movie") {
                var image = imageMovie;
            } else {//it's the user's location
                var image = imageUser;
            };
        };

        if (singleOrMultiple = "single") {//number of markers to place
            var marker = new google.maps.Marker({
                position: theLatLong,
                map: map,
                icon: image,
                shape: shape,
                title: title,
                // zIndex: zindex //we may or may not want to use this
            });
        } else {
            for (var i = 0; i < venues.length; i++) {//multiple needs a venues
                //array, see sample data above
                var venue = venues[i];
                var marker = new google.maps.Marker({
                    position: { lat: venue[1], lng: venue[2] },
                    map: map,
                    icon: image,
                    shape: shape,
                    title: venue[0],
                    // zIndex: venue[3] //we may or may not want to use this
                });
            };
        };
    };
    //#endregion

    //#region - restaurant selection
    //on-submit event for restaurant form, also adds this info the firebase database,
    $("#restaurant-form").on("submit", function (event) {
        event.preventDefault();
        gotRestaurantData = false;
        //clear previous results
        $("#restaurant-table").empty();
        //get current parameters
        var restaurantSelection = $("#inputFood").val().trim();
        var selectedTime = $("#inputTime").val().trim();
        console.log("restaurant" + restaurantSelection);
        console.log("time" + selectedTime);
        //format time for UNIX conversion
        let todaysDate = new Date().toLocaleDateString("en-US");
        var theSelectedTime = todaysDate + " " + selectedTime;
        //add seach parameters to firebase database
        database.ref(userPreferencesPath).set({
            restaurantType: restaurantSelection,
            requestedTime: theSelectedTime,
        });
        //clear the form
        $("#inputFood").val("");
        $("#inputTime").val("");
        $("#myModal").modal('toggle');
    });
    //dd-branch
    //on-click event for restaurant selection 
    $(document).on("click", ".restaurant-row", function () {
        console.log("i've been clicked");
        var restaurantLongitude = $(this).attr("data-longitude");
        var restaurantLatitude = $(this).attr("data-latitude");
        console.log("Longitude: " + restaurantLongitude);
        console.log("Latitude: " + restaurantLatitude);
        var restaurantPic = $(this).find(".restaurant-pic").prop("src");
        console.log("src: " + restaurantPic);
        var restaurantName = $(this).children(".restaurant-name").text();
        console.log("name: " + restaurantName);
        database.ref(userRestaurantPath).set({
            restaurantLat: restaurantLatitude,
            restaurantLong: restaurantLongitude,
            restaurantImg: restaurantPic,
            name: restaurantName
        });
    });
    //#endregion

    //#region - firebase listeners
    connectedRef.on("value", function (connectedSnapshot) {
        if (connectedSnapshot.val()) {
            var theConnection = connectionsRef.push(true);
            theConnection.onDisconnect().remove();
        };
    });

    // connectionsRef.on("value", function (connectionsSnapshot) {
    //     console.log("number online: " + connectionsSnapshot.numChildren());
    // }); // Number of online users is the number of objects in the presence list.

    firebase.auth().signInAnonymously().catch(function (error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log("anonymous login error: " + errorCode, errorMessage);
        // ...
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("auth state changed: " + user.uid);
            userID = user.uid;
            // User is signed in.
            userSignedIn = true;
            userIdentificationPath = "users/" + userID + "/identification";
            userCoordinatesPath = "users/" + userID + "/coordinates";
            userPreferencesPath = "users/" + userID + "/preferences";
            userRestaurantPath = "users/" + userID + "/restaurants";
        };
        getLocation();
    });

    database.ref(userCoordinatesPath).on("value", function (snapshot) {
        console.log
        console.log("user coordinates path value change " + userCoordinatesPath, userID);
        let theCurrentLat = snapshot.child(userCoordinatesPath + "/currentLat").val();
        let theCurrentLong = snapshot.child(userCoordinatesPath + "/currentLong").val();
        console.log("latlong from firebase: " + theCurrentLat, theCurrentLong);
        let userLatLong = { lat: theCurrentLat, lng: theCurrentLong };
        placeComplexMarker(userLatLong, "You are here", "user", "single");
    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    database.ref(userPreferencesPath).on("value", function (snapshot) {
        console.log("user preferences path value change " + userPreferencesPath, userID);
        let theRestaurantType = snapshot.child(userPreferencesPath + "/restaurantType").val();
        let theRequestedTime = snapshot.child(userPreferencesPath + "/requestedTime").val();
        console.log("userquery from firebase: " + theRestaurantType, theRequestedTime);
        theRequestedTime = moment(theRequestedTime, "M/D/YYYY HH:mm ").format("X");
        console.log("theRequestedTime: " + theRequestedTime);
        if (!gotRestaurantData && userLatitude) {
            yelpAPICall(theRestaurantType, theRequestedTime);
        }
    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    // database.ref(userRestaurantPath).on("value", function (snapshot) {
    //     console.log(snapshot.val());
    // });
    //#endregion

    //#region - yelp

    // TODO: call placeComplexMarker(theLatLong, title, restaurantOrMovie, singleOrMultiple)

    // theLatLong is an object formatted like this: { lat: userLatitude, lng: userLongitude }
    // NOTE: theLatLong is NOT NEEDED when placing multiple markers, but YOU MUST put 0 in its place

    // title is a string consisting of the venue name
    // NOTE: title is NOT NEEDED when placing multiple markers, but YOU MUST put "" in its place

    // values for restaurantOrMovie are "restaurant" or "movie"
    // values for singleOrMultiple are "single" or "multiple" (markers to place)
    // NOTE: when placing multiple markers, you must populate the array named "venues"
    // see bottom of this javascript file for a description of that array

    function yelpAPICall(restaurantType, requestedTime) {
        console.log(userLatitude + userLongitude);
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
            console.log(response);
            console.log(response.businesses)
            gotRestaurantData = true;
            addRestaurants(response.businesses)
        });
    }

    function addRestaurants(restaurantArray) {
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
            venues.push([restaurant.name, restaurant.coordinates.latitude, restaurant.coordinates.longitude, 1]);
        };
        placeComplexMarker(0, "", "restaurant", multiple, venues);
        console.log(venues);
    }
    //#endregion


    // ---------------------------------------------------------------------------
    // TODO: [X]Daniel/restaurants: Please make a function to
    // get the necessary data out of your API responses and set the global array
    // "venues" on the fly with the following format to put your venue locations
    // on map, then call placeComplexMarker(0, "", "restaurant", multiple, venues);
    //
    // venues = [
    //     ["restaurant name in double quotes", restaurant-latitude, restaurant-longitude, z-index],
    //     ["another restaurant name", restaurant-latitude, restaurant-longitude, z-index],
    // ];
    //
    // Here's some sample data:
    // venues = [
    //     ["Cocina Desmond", 35.8296462, -79.1090949, 1],
    //     ["Willie's BBQ", 35.83, -79.11, 1],
    // ];
    // ---------------------------------------------------------------------------


    // ---------------------------------------------------------------------------
    // TODO: [ ]John/movies: Please make a function to get the movie theater
    // name out of your API responses and make an array called movieTheaterNames
    // with a list of the names formatted list this:
    // movieTheaterNames = ["theater 1 name", "theater 2 name", "etc..."];
    //
    // then you just call getLatLongFromVenueName(movieTheaterNames) and I'll do
    // the rest
    // ---------------------------------------------------------------------------

    //#region - testing
    $(document).on("click", function (event) {
        if (event.originalEvent.getModifierState("Alt")) {//if the alt or option key is pressed then
            switch ($("#testing-wrapper").css("display")) {
                case "none":
                    $("#testing-wrapper").css("display", "block");
                    break;
                case "block":
                    $("#testing-wrapper").css("display", "none");
                    break;
            }
        };
    });

    $(document).on('click', '.test-button', function (event) {
        let theButton = event.target.id
        // console.log(theButton);
        switch (theButton) {
            case "test-1":
                testOne();
                break;
            case "test-2":
                testTwo();
                break;
            case "test-3":
                testThree();
                break;
        }
    });

    function testOne() {
        console.log("executes addRestaurants - expected input is response.businesses from the Yelp API");
        console.log("paste the contents of response.business in the input field.");
        var testVarOne = $("#testing-input").val();
        addRestaurants(testVarOne);
    };
    function testTwo() {
        console.log("executes placeComplexMarker - expected input is the array 'venues' after processing the Yelp API");
        console.log("paste the array-only in the input field. declaring 'venues =...' is not needed.");
        var testVarTwo = $("#testing-input").val();
        placeComplexMarker(0, "", "restaurant", "multiple", testVarTwo);
    };
    function testThree() {
        console.log("executes getLatLongFromVenueName - expected input is the array 'movieTheaterNames' after processing the movies API");
        console.log("paste the array-only in the input field. declaring 'movieTheaterNames = ...' is not needed.");
        var testVarThree = $("#testing-input").val();
        getLatLongFromVenueName(testVarThree);
    };
    //#endregion
});