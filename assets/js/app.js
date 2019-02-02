$(document).ready(function () {
    // Initialize Firebase
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

    function getLocation() {
        console.log("get location");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
            let todaysDate = new Date().toLocaleDateString("en-US");
            let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            database.ref().set({
                dateTime: todaysDate + " " + currentTime,
                currentLat: userLatitude,
                currentLong: userLongitude,
            });
            console.log(todaysDate, currentTime, userLatitude, userLongitude);

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
            console.log("Latitude: " + userLatitude + ", Longitude: " + userLongitude);
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

    //#region - firebase listeners
    var userIdentificationPath;
    var userCoordinatesPath;
    var userPreferencesPath;
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
        console.log(connectionsSnapshot.child("connections").child(0).val());
    }); // Number of online users is the number of objects in the presence list.

    function testDataBaseWrite() {
        let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        database.ref("new").set({
            dateTime: currentTime,
            currentLat: "latitude",
            currentLong: "longitude",
        });
    };
    testDataBaseWrite()

    firebase.auth().onAuthStateChanged(function (user) {
        console.log("inside auth state changed");
        console.table(user);
        if (user) {
            console.log("inside if user");
            console.log("auth state changed: " + user.uid);
            userID = user.uid;
            console.log(userID);
            // User is signed in.
            userSignedIn = true;
            userIdentificationPath = "users/" + userID + "/identification";
            userCoordinatesPath = "users/" + userID + "/coordinates";
            userPreferencesPath = "users/" + userID + "/preferences";
        };
        getLocation();
    });

    database.ref(userPreferencesPath).on("value", function (snapshot) {
        console.log("user preferences path value change");
        console.table(snapshot);
        let theMessageDateTime = snapshot.child(userPreferencesPath).val();
        let theMessageUserName = snapshot.child(userPreferencesPath).val();
        console.log("the message date time: " + theMessageDateTime);
        console.log("the message user time: " + theMessageUserName);

    }, function (errorObject) {
        console.log("entries-error: " + errorObject.code);
    });
    //#endregion

    //#region - yelp
    function yelpAPICall(restaurantType, requestedTime) {
        var settings = {
            "url": "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + restaurantType + "&latitude=" + userLatitude + "&longitude=" + userLongitude,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer mLgzYdES6ZMGJESWIiT0bSE_fjoQq1-1TqsNNHRyEm3yGWahTdS7oelkMQ0kiZ_WMiE7Ggepj6UkfjwHSwxyDCdGZ4aPPLGul4l5r6FaFzi9a57QZZ4SX-OBfEBUXHYx"
            },
        };
        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }

    yelpAPICall("Italian".toLowerCase());
    //#endregion

    console.log("v1.1");
});