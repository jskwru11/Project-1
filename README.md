# Project-1

**Our cleverly-named *Project-1* lets users find a restaurant with a tool like Yelp but at the same time - and on the same map - see movie theaters and movie times nearby.**

# Features
In addition to the basic functions of the assignment, this app does the following:

### REALLY COOL BITS:
* User's location is found with browser geolocation and then shown on map as soon as they load the page. Once they've made Yelp-style selections to find a restaurant, a list of restaurants populates to the left of the map and yellow markers indicate the restaurant locations on the map.
* Once one restaurant is chosen and clicked in the list, the map re-centers on that restaurant's location and movie theater and showtime information is displayed under the restaurant name on the left side* (*theater name and showtimes list will display in v2). Movie theater locations are marked in blue on the map around the restaurant center.
* Because some of the function of our project requires the site to be deployed to test (e.g., Google Maps will not reply to a request from a local page), testing presented extra hurdles. One of the ways we devised to work around this limitation was the creation of a set of Testing Tools made available/visible with an [option]-click anywhere in the browser window. The Testing Tools presented a set of buttons, a textarea, and a results display area allowing many possibilities just by changing the javascript underlying the tools.

As an example of the use of Testing Tools, our movies API does not return theater latitude/longitude, but rather just names of theaters. Because we needed Google Places to give us latitude/longitude for map marker based on a name search, we needed to test on a *deployed* site. By bringing up the Testing Tools on the deployed site, we were able to manually enter a list of theater names and then invoke the getLatLongFromVenueName function. The Testing Tools javascript function takes the textarea input and formats it the same way as the variable passed in normal application function. This allows us to test setting Maps markers based on a list of theater names. Another [option]-click hides the Testing Tools leaving a fully-presentable deployed site.
* Fully functional and responsive on mobiles.