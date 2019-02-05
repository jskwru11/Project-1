$(document).ready(function () {
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
    //#endregion

    //#region - geolocation
    var userLatitude;
    var userLongitude;
    var initMapLatLong;
    var mapDisplayField = $("#map");
    var gotRestaurantData = true;
    


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
            initMap();
        }
    }
    
    function initMap() {
        setTimeout(function () {
            console.log("init map: " + userLatitude, userLongitude);
            initMapLatLong = userLatitude, userLongitude;
            var userLatLong = { lat: userLatitude, lng: userLongitude };
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 16,
                center: userLatLong
            });
            placeMarker(userLatLong, "You are here");
            let todaysDate = new Date().toLocaleDateString("en-US");
            let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            database.ref(userCoordinatesPath).set({
                dateTime: todaysDate + " " + currentTime,
                currentLat: userLatitude,
                currentLong: userLongitude,
            });
            // SAMPLE DATA FOR TESTING! REMOVE FOR PRODUCTION!
            // let restaurantType = "italian";
            // let requestedTime = todaysDate + " " + currentTime
        }, 500);
    }
    //#endregion

    //#region - markers
    function placeMarker(theLatLong, title) {
        var marker = new google.maps.Marker({
            position: theLatLong,
            map: map,
            title: title
        });
    }
    //#endregion

    //on-submit event for restaurant form, also adds this info the firebase database,
    $("#restaurant-form").on("submit", function(event){
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

        
    });

    //on-click event for restaurant selection 
    $(document).on("click", ".restaurant-row", function(){
        console.log("i've been clicked");
        var restaurantLongitude = $(this).attr("data-longitude");
        var restaurantLatitude = $(this).attr("data-latitude");
        console.log("Longitude: " + restaurantLongitude);
        console.log("Latitude: " + restaurantLatitude);
        database.ref(userRestaurantPick).set({
            restaurantLat: restaurantLatitude,
            restaurantLong: restaurantLongitude
        });
    });
    
    //#region - firebase listeners
    var userIdentificationPath;
    var userCoordinatesPath;
    var userPreferencesPath;
    var userRestaurantPick;
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
        };
        getLocation();
    });

    database.ref(userCoordinatesPath).on("value", function (snapshot) {
        console.log
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
        if(!gotRestaurantData && userLatitude){   
            yelpAPICall(theRestaurantType, theRequestedTime);
        }
    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });

    database.ref(userRestaurantPick).on("value", function (snapshot){
        console.log(snapshot.val());
    });
    //#endregion

    //#region - yelp
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

    function addRestaurants(restaurtArray){
        for(var i = 0; i < restaurtArray.length; i++){
            var restaurant = restaurtArray[i];
            var newImage = $("<image src=" + restaurant.image_url+ ">");
            newImage.addClass("restaurant-pic");
            var newRow = $("<tr>");
            newRow.attr("data-longitude", restaurant.coordinates.longitude);
            newRow.attr("data-latitude", restaurant.coordinates.latitude);
            newRow.addClass("restaurant-row");
            var nameColumn = $("<td>").text(restaurant.name);
            var descriptionColumn = $("<td>").text(restaurant.rating);
            var priceColumn = $("<td>").text(restaurant.price);
            var imageColumn = $("<td>").html(newImage);
            newRow.append(imageColumn, nameColumn, descriptionColumn, priceColumn);
            $("#restaurant-table").append(newRow);
        }
    }


    //#endregion

    console.log("v1.3"); //this is updated so you can see when GitHub has actually deployed your code. This is necessary for testing stuff with CORS limitations (like Google Maps)
});