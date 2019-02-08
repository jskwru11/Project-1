console.log("v1.400"); //this is updated so you can see when GitHub has actually deployed your code. This is necessary for testing stuff with CORS limitations (like Google Maps)

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
let moviesArray;


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
            var userLatLong = { lat: userLatitude, lng: userLongitude };
            var zoom = 11;
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: zoom,
                center: userLatLong
            });
            var marker = new google.maps.Marker({
                position: userLatLong,
                map: map,
                title: "You are here"
            });

            infowindow = new google.maps.InfoWindow();
            service = new google.maps.places.PlacesService(map);

            service.findPlaceFromQuery(request, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
                }
            });

            function createMarker(place) {
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name
                });

                google.maps.event.addListener(marker, "click", function () {
                    infowindow.setContent(place.name);
                    infowindow.open(map, this);
                });
            }

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

    function redrawMapWithRestaurantPosition(theLatLong) {
        if (theLatLong != userLatitude, userLongitude) {
            console.log("redrawMapWithRestaurantPosition: " + theLatLong + " / " + userLatitude, userLongitude);
            initMap();
        }
    }

    function getLatLongFromVenueName(movieTheaterNames) {
        console.log("movieTheaterNames array on next line...");
        console.log(movieTheaterNames);
        infowindow = new google.maps.InfoWindow();

        for (let i = 0; i < movieTheaterNames.length; i++) {
            console.log("getting location of: " + movieTheaterNames[i]);
            request = {
                query: movieTheaterNames[i],
                fields: ["name", "geometry"],
            };

            service = new google.maps.places.PlacesService(map);

            service.findPlaceFromQuery(request, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i]);
                    }
                }
            });

            function createMarker(place) {
                var marker = new google.maps.Marker({
                    icon: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
                    map: map,
                    position: place.geometry.location,
                    title: place.name
                });

                google.maps.event.addListener(marker, "click", function () {
                    infowindow.setContent(place.name);
                    infowindow.open(map, this);
                });
            };
        };
    };
    //#endregion

    //#region - markers
    function placeMarker(theLatLong, title, restaurantOrMovie, venues) {
        if (restaurantOrMovie = "restaurant") {
            var icon = "https://maps.gstatic.com/mapfiles/ms2/micons/yellow.png";
        } else {
            if (restaurantOrMovie = "movie") {
                var icon = "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png";
            } else {//it's the user's location. We're not using this presently
                var icon = "https://maps.gstatic.com/mapfiles/ms2/micons/red.png";
            };
        };
        for (var i = 0; i < venues.length; i++) {
            console.log("processing: " + venues[i]);
            var venue = venues[i];
            var marker = new google.maps.Marker({
                position: { lat: parseFloat(venue[1]), lng: parseFloat(venue[2]) },
                map: map,
                icon: icon,
                title: venue[0],
                zIndex: venue[3] //we may or may not want to use this
            });
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
        //set to currentTime if no time Selected
        let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentTime = moment(currentTime, "hh:mm a").format("HH:mm");
        console.log("THIS IS THE CURRENT TIME", currentTime);
        if (!selectedTime) {
            selectedTime = currentTime;
        }
        //check for price selection
        var priceSelected = []
        $(".toggle").each(function (index) {
            if ($(this).hasClass("btn-success")) {
                priceSelected.push(index + 1)
            }
        });
        if (priceSelected.length === 0) {
            priceSelected = [1, 2, 3, 4];
        }
        console.log("SELECTED PRICE", priceSelected);
        console.log("restaurant" + restaurantSelection);
        console.log("time" + selectedTime);
        //format time for UNIX conversion
        let todaysDate = new Date().toLocaleDateString("en-US");
        var theSelectedTime = todaysDate + " " + selectedTime;
        //add seach parameters to firebase database
        database.ref(userPreferencesPath).set({
            restaurantType: restaurantSelection,
            requestedTime: theSelectedTime,
            priceRange: priceSelected.toString()
        });
        //clear the form
        $("#inputFood").val("");
        $("#inputTime").val("");
        $("#myModal").modal('toggle');
    });
    //on-click event for restaurant selection 
    $(document).on("click", ".restaurant-row", function () {
        console.log("i've been clicked");
        var restaurantLongitude = $(this).attr("data-longitude");
        var restaurantLatitude = $(this).attr("data-latitude");
        console.log("Longitude: " + restaurantLongitude);
        console.log("Latitude: " + restaurantLatitude);
        initMapLatLong = restaurantLatitude, restaurantLongitude;
        restaurantMapLatLong = restaurantLatitude, restaurantLongitude;
        redrawMapWithRestaurantPosition(restaurantMapLatLong);
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
        $(".restaurant-row").not($(this)).remove();
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
        console.log("user coordinates path value change " + userCoordinatesPath, userID);
        let theCurrentLat = snapshot.child(userCoordinatesPath + "/currentLat").val();
        let theCurrentLong = snapshot.child(userCoordinatesPath + "/currentLong").val();
        console.log("latlong from firebase: " + theCurrentLat, theCurrentLong);
        let userLatLong = { lat: theCurrentLat, lng: theCurrentLong };
    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    database.ref(userPreferencesPath).on("value", function (snapshot) {
        console.log("user preferences path value change " + userPreferencesPath, userID);
        let theRestaurantType = snapshot.child(userPreferencesPath + "/restaurantType").val();
        let theRequestedTime = snapshot.child(userPreferencesPath + "/requestedTime").val();
        let priceRangeSelected = snapshot.child(userPreferencesPath + "/priceRange").val();
        console.log("PRICE RANGE FROM FIREBASE", priceRangeSelected);
        console.log("userquery from firebase: " + theRestaurantType, theRequestedTime);
        theRequestedTime = moment(theRequestedTime, "M/D/YYYY HH:mm ").format("X");
        console.log("theRequestedTime: " + theRequestedTime);
        if (!gotRestaurantData && userLatitude) {
            yelpAPICall(theRestaurantType, theRequestedTime, priceRangeSelected);
        }
    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    database.ref(userRestaurantPath).on("value", function (snapshot) {
        const selectedRestLoc = {};
        console.log("restaurant snapshot on next line...");
        console.log(snapshot.val());
        var restaurantName = snapshot.child(userRestaurantPath + "/name").val();
        var restaurantLat = snapshot.child(userRestaurantPath + "/restaurantLat").val();
        var restaurantLong = snapshot.child(userRestaurantPath + "/restaurantLong").val();
        selectedRestLoc.lat = restaurantLat;
        selectedRestLoc.lng = restaurantLong;
        console.log(selectedRestLoc);
        moviesArray = getData(selectedRestLoc);
        console.log(moviesArray);

        console.log("RESTAURANT INFO name" + restaurantName + " lat: " + restaurantLat + "long: " + restaurantLong);
        getLatLongFromVenueName(moviesArray);
    });
    //#endregion

    //#region - yelp

    // theLatLong is an object formatted like this: { lat: userLatitude, lng: userLongitude }
    // title is a string consisting of the venue name
    // NOTE: title is NOT NEEDED when placing multiple markers, but YOU MUST put "" in its place
    // values for restaurantOrMovie are "restaurant" or "movie"
    // values for singleOrMultiple are "single" or "multiple" (markers to place)
    // NOTE: when placing multiple markers, you must populate the array named "venues"
    // see bottom of this javascript file for a description of that array

    function yelpAPICall(restaurantType, requestedTime, priceRange) {
        console.log("yelpAPICall user latLong on next line...");
        console.log(userLatitude + userLongitude);
        gotRestaurantData = true;
        var settings = {
            "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + restaurantType + "&latitude=" + userLatitude + "&longitude=" + userLongitude + "&open_at=" + requestedTime + "&price=" + priceRange + "&limit=10",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer mLgzYdES6ZMGJESWIiT0bSE_fjoQq1-1TqsNNHRyEm3yGWahTdS7oelkMQ0kiZ_WMiE7Ggepj6UkfjwHSwxyDCdGZ4aPPLGul4l5r6FaFzi9a57QZZ4SX-OBfEBUXHYx"
            },
        };
        $.ajax(settings).done(function (response) {
            console.log("yelpAPICall response and response.business on next two lines...");
            console.log(response);
            console.log(response.businesses)
            gotRestaurantData = true;
            if (response.businesses.length < 1) {
                var alertDiv = $("<div>").text("There are no restaurants matching that request. Bummer. Try another!");
                $("#restaurant-table").append(alertDiv);
            }
            else {
                addRestaurants(response.businesses)
            }
        });
    }

    function addRestaurants(restaurantArray) {
        venues = [];
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
        console.log("addRestaurants venues on next line...");
        console.log(venues);
        // placeMarker({ lat: 35.83, lng: -79.11 }, "", "restaurant", venues);
        placeMarker(0, "", "restaurant", venues);
    };
    //#endregion

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
                    $("#testing-input").val("Lumina Theatre, Chelsea Theater, Silverspot Cinema, Varsity Theatre, AMC Southpoint 17, Regal Cinemas Timberlyne 6, AMC CLASSIC Durham 15, Regal Cinemas Beaver Creek 12, Frank Theatres CineBowl & Grille, Imax, AMC Park Place 16, AMC DINE-IN Holly Springs 9, Park West 14, Regal Cinemas Brier Creek 14, Carmike Cinemas, Northgate Stadium 10, Cinemark Raleigh Grande, Phoenix Theatres 10, The Cary Theater, Historic Playmakers Theatre, Full Frame Theater, Regal Cinemas Crossroads 20 & IMAX, AMC Theater, The Carolina Theatre, CinéBistro, Shadowbox Studio, Regal Cinemas North Hills 14, AMC CLASSIC Blueridge 14, Frank Theatres Spring Lane Stadium 10");
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
        console.log("this test is currently unused");
    };
    function testTwo() {
        console.log("this test is currently unused");
    };
    function testThree() {
        console.log("This test executes getLatLongFromVenueName. Expected input to that function");
        console.log("is an array named 'movieTheaterNames' which gets created after");
        console.log("processing the movies API and is formatted like this:");
        console.log("['theater name', 'another theater name']");
        console.log("To test, enter ONLY a comma-separated list of venue names. This test");
        console.log("function will turn the comma-separated names into an array matching");
        console.log("the format of movieTheaterNames and then submit it to getLatLongFromVenueName.");
        console.log("Here is some sample data you can cut and paste:");
        console.log("Lumina Theatre, Chelsea Theater, Silverspot Cinema, Varsity Theatre, AMC Southpoint 17, Regal Cinemas Timberlyne 6, AMC CLASSIC Durham 15, Regal Cinemas Beaver Creek 12, Frank Theatres CineBowl & Grille, Imax, AMC Park Place 16, AMC DINE-IN Holly Springs 9, Park West 14, Regal Cinemas Brier Creek 14, Carmike Cinemas, Northgate Stadium 10, Cinemark Raleigh Grande, Phoenix Theatres 10, The Cary Theater, Historic Playmakers Theatre, Full Frame Theater, Regal Cinemas Crossroads 20 & IMAX, AMC Theater, The Carolina Theatre, CinéBistro, Shadowbox Studio, Regal Cinemas North Hills 14, AMC CLASSIC Blueridge 14, Frank Theatres Spring Lane Stadium 10");
        var theString = $("#testing-input").val();
        testVarThree = Array.from((theString.split(", ")));
        console.log("the array going to getLatLongFromVenueNames: " + testVarThree);
        try {
            getLatLongFromVenueName(testVarThree);
        }
        catch (err) {
            console.log("testThree error: " + err.message);
        }
    };
    //#endregion

});