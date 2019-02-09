
    const APIKEY = 'cf36ya2yf3yn6kxnxprmrfbm';
    // '2m5fs9kvktd48xcrz569rjkn' '7dadpsd62b4jwc7a92arb7fb'


    let baseUrl = 'https://data.tmsapi.com/v1.1/movies/showings?';
    let dateNow = moment().format('YYYY-MM-DD');
    let restLocation = {lat: 35.851000, lng: -78.796130};
    let radius = 10;
   
    
    const encodeURL = (startDate, loc, radius) => {
        const url = baseUrl;
        const date = startDate;
        const center = {...loc};
        const distance = radius;
        return `${url}startDate=${date}&lat=${center.lat}&lng=${center.lng}&radius=${distance}&api_key=${APIKEY}`
    }
    
    const getData = (loc) => {
        const theatreNames = [];
        var res;
        $.get(encodeURL(dateNow, loc, radius)).then(res => {
            
            let data;
            console.log('api data fetched');
            console.log("OJBECT FROM API CALL", res);
           
            data = res.map(data => data.showtimes);
            data.forEach(results => {
                results.forEach(theatre => {
                    if (theatreNames.indexOf(theatre.theatre.name) === -1)
                    theatreNames.push(theatre.theatre.name);
                    })
                })
                sortObject(res, theatreNames);
            })
            .catch(error => {
            console.log(`You have encountered an error: ${error}`)
        });
        
        return theatreNames;
        
}
        

// function sortObject (res, theatreNames){
//   console.log("OBJECT FROM SORTOBJECT", res);
//   console.log("THEATERS FROM SORTOBJECT", theatreNames);

//   // sort through res by theater names 
// for( var i = 0; i < theatreNames.length; i++){
//     for(var j = 0; j < res.length; j++){
//         for (var x = 0; x < res[j].showtimes.length; x++){
           
//             if(res[j].showtimes[x].theatre.name === theatreNames[i]){
//                 console.log("THEATER NAME", res[j].showtimes[x].theatre.name);
//                 console.log("THEATER NAME", theatreNames[i])
//         //         var movieTitles = [];
//         //         movieTitles.push(res[j].title)
//         //         movieInfo = {
//         //         time: res[j].showtimes[x].dateTime
//         // }
//         var obj ={
//             theater: 'name',
//             movie: [{movie:'spider',time:['']}
//         }
//     }
//     }
//     }
// }
// }

// user + uid + restaurants . restaurant.Lat, restaurant.Long

// dateTime: "2019-02-02T12:20"


//http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-02-02&lat=35.851000&lng=-78.796130&api_key=7dadpsd62b4jwc7a92arb7fb

//http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-02-02&zip=27517&api_key=//