$(document).ready(function () {
    //#region - firebase authentication

    //#endregion

    //#region - geolocation
    var userLatitude;
    var userLongitude;
    var initMapLatLong;
    var mapDisplayField = $("#map");
    var gotRestaurantData = true;
    var userID ='';

    // function getLocation() {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(showPosition);
    //     } else {
    //         console.log("Geolocation is not supported by this browser");
    //     }
    // }

    // function showPosition(position) {
    //     userLatitude = parseFloat(position.coords.latitude);
    //     userLongitude = parseFloat(position.coords.longitude);
    //     if (initMapLatLong != userLatitude, userLongitude) {
    //         initMap();
    //     }
    // }

    // function initMap() {
    //     setTimeout(function () {
    //         console.log("init map: " + userLatitude, userLongitude);
    //         initMapLatLong = userLatitude, userLongitude;
    //         let userLatLong = { lat: userLatitude, lng: userLongitude };
    //         let zoom = 16
    //         map = new google.maps.Map(document.getElementById("map"), {
    //             zoom: zoom,
    //             center: userLatLong
    //         });
    //         placeComplexMarker(userLatLong, "You are here", "user", "single");
    //         let todaysDate = new Date().toLocaleDateString("en-US");
    //         let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //         database.ref(userCoordinatesPath).set({
    //             dateTime: todaysDate + " " + currentTime,
    //             currentLat: userLatitude,
    //             currentLong: userLongitude,
    //         });
    //     }, 500);
    // }
    //#endregion

    //#region - extract venue latitude and longitude from name search

    //#endregion

    //#region - markers
    
    //see https://developers.google.com/maps/documentation/javascript/examples/icon-complex

    // Origins, anchor positions and coordinates of the marker increase in the X
    // direction to the right and in the Y direction down.
    // var imageRestaurant = {//TODO: one image for restaurants, another for movies
    //     url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    //     // This marker is 20 pixels wide by 32 pixels high.
    //     size: new google.maps.Size(20, 32),
    //     // The origin for this image is (0, 0).
    //     origin: new google.maps.Point(0, 0),
    //     // The anchor for this image is the base of the flagpole at (0, 32).
    //     anchor: new google.maps.Point(0, 32)
    // };
    // var imageMovie = {//TODO: one image for restaurants, another for movies
    //     url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    //     // This marker is 20 pixels wide by 32 pixels high.
    //     size: new google.maps.Size(20, 32),
    //     // The origin for this image is (0, 0).
    //     origin: new google.maps.Point(0, 0),
    //     // The anchor for this image is the base of the flagpole at (0, 32).
    //     anchor: new google.maps.Point(0, 32)
    // };

    // var imageUser = {//TODO: one image for restaurants, another for movies
    //     url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    //     // This marker is 20 pixels wide by 32 pixels high.
    //     size: new google.maps.Size(20, 32),
    //     // The origin for this image is (0, 0).
    //     origin: new google.maps.Point(0, 0),
    //     // The anchor for this image is the base of the flagpole at (0, 32).
    //     anchor: new google.maps.Point(0, 32)
    // };

    //TODO: SAMPLE DATA - this array will be constructed on the fly
    //each time multiple markers need to be set down. the following is
    //sample data and should be deleted for production.
    // venues = [
    //     ["Cocina Desmond", 35.8296462, -79.1090949, 1],
    //     ["Willie's BBQ", 35.83, -79.11, 1],
    // ];

    // function placeMarker(theLatLong, title) { //this is the simple version
    //     //which we may not use
    //     var marker = new google.maps.Marker({
    //         position: theLatLong,
    //         map: map,
    //         title: title
    //     });
    // }

    // function placeComplexMarker(theLatLong, title, restaurantOrMovie, singleOrMultiple) {//see https://developers.google.com/maps/documentation/javascript/examples/icon-complex
    //     // Marker sizes are expressed as a Size of X,Y where the origin of the image
    //     // (0,0) is located in the top left of the image.

    //     // Shapes define the clickable region of the icon. The type defines an HTML
    //     // <area> element 'poly' which traces out a polygon as a series of X,Y points.
    //     // The final coordinate closes the poly by connecting to the first coordinate.
    //     var shape = {//TODO: question - hard-wire a single shape? use no shape?
    //         coords: [1, 1, 1, 20, 18, 20, 18, 1],
    //         type: 'poly'
    //     };

    //     if (restaurantOrMovie = "restaurant") {
    //         var image = imageRestaurant;
    //     } else {
    //         if (restaurantOrMovie = "movie") {
    //             var image = imageMovie;
    //         } else {//it's the user's location
    //             var image = imageUser;
    //         };
    //     };

    //     if (singleOrMultiple = "single") {//number of markers to place
    //         var marker = new google.maps.Marker({
    //             position: theLatLong,
    //             map: map,
    //             icon: image,
    //             shape: shape,
    //             title: title,
    //             // zIndex: zindex //we may or may not want to use this
    //         });
    //     } else {
    //         for (var i = 0; i < venues.length; i++) {//multiple needs a venues
    //             //array, see sample data above
    //             var venue = venues[i];
    //             var marker = new google.maps.Marker({
    //                 position: { lat: venue[1], lng: venue[2] },
    //                 map: map,
    //                 icon: image,
    //                 shape: shape,
    //                 title: venue[0],
    //                 // zIndex: venue[3] //we may or may not want to use this
    //             });
    //         };
    //     };
    // };
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
        var restaurantPic = $(this).find(".restaurant-pic").prop("src");
        var restaurantName = $(this).children(".restaurant-name").text();
        database.ref(userRestaurantPath).set({
            restaurantLat: restaurantLatitude,
            restaurantLong: restaurantLongitude,
            restaurantImg: restaurantPic,
            name: restaurantName
        });
    });
    //#endregion

    //#region - firebase listeners
    var userIdentificationPath;
    var userCoordinatesPath;
    var userPreferencesPath;
    var userRestaurantPath;
    var connectionsRef = database.ref("/connections");
    var connectedRef = database.ref(".info/connected");


    connectedRef.on("value", function (connectedSnapshot) {
        if (connectedSnapshot.val()) {
            var theConnection = connectionsRef.push(true);
            theConnection.onDisconnect().remove();
        };
    });

    connectionsRef.on("value", function (connectionsSnapshot) {
        console.log("number online: " + connectionsSnapshot.numChildren());
    }); // Number of online users is the number of objects in the presence list.

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
        // getLocation();
    });
    

    database.ref(userCoordinatesPath).on("value", function (snapshot) {
        console.log("user coordinates path value change " + userCoordinatesPath, userID);
        let theCurrentLat = snapshot.child(userCoordinatesPath + "/currentLat").val();
        let theCurrentLong = snapshot.child(userCoordinatesPath + "/currentLong").val();
        console.log("from firebase: " + theCurrentLat, theCurrentLong);

    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    database.ref(userPreferencesPath).on("value", function (snapshot) {
        console.log("user preferences path value change " + userPreferencesPath, userID);
        let theRestaurantType = snapshot.child(userPreferencesPath + "/restaurantType").val();
        let theRequestedTime = snapshot.child(userPreferencesPath + "/requestedTime").val();
        console.log("from firebase: " + theRestaurantType, theRequestedTime);
        theRequestedTime = moment(theRequestedTime, "M/D/YYYY HH:mm ").format("X");
        console.log(theRequestedTime);
        if (!gotRestaurantData && userLatitude) {
            yelpAPICall(theRestaurantType, theRequestedTime, userLatitude, userLongitude);
        }
    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    database.ref(userRestaurantPath).on("child_added", function (snapshot) {
        console.log("user restaurant path value change " + userRestaurantPath, userID);
        console.log('data from firebase selected restaurant!!!');
        snapshot.forEach(data => {
            getData(data.val().coordinates)
            console.log(data.val().coordinates)
        });
    });


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


    //#endregion


    // ---------------------------------------------------------------------------
    // TODO: [ ]Daniel/restaurants, and [ ]John/movies: Please make a function to
    // get the necessary data out of your API responses and set the global array
    // "venues" on the fly with the following format to put your venue locations on map.

    // venues = [
    //     ["restaurant name in double quotes", restaurant-latitude, restaurant-longitude, z-index],
    //     ["another restaurant name", restaurant-latitude, restaurant-longitude, z-index],
    // ];

    // Here's some sample data:
    // venues = [
    //     ["Cocina Desmond", 35.8296462, -79.1090949, 1],
    //     ["Willie's BBQ", 35.83, -79.11, 1],
    // ];
    // ---------------------------------------------------------------------------
    console.log("v1.3"); //this is updated so you can see when GitHub has actually deployed your code. This is necessary for testing stuff with CORS limitations (like Google Maps)
});
