
    const APIKEY = 'dp99ze7uepwt88ykbkfnpf4d';
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
        console.log(`${url}startDate=${date}&lat=${center.lat}&lng=${center.lng}&radius=${distance}&api_key=${APIKEY}`);
        return `${url}startDate=${date}&lat=${center.lat}&lng=${center.lng}&radius=${distance}&api_key=${APIKEY}`;
    }
    
    const getData = (loc) => {
        const theatreNames = [];
        return new Promise((resolve, reject) => {
              $.get(encodeURL(dateNow, loc, radius)).then(res => {
             let data;
             console.log('api data fetched');
             data = res.map(data => data.showtimes);
             data.forEach(results => {
                 results.forEach(theatre => {
                     if (theatreNames.indexOf(theatre.theatre.name) === -1)
                     theatreNames.push(theatre.theatre.name);
                 })
             })
             resolve(theatreNames);
         })
         .catch(error => {
             reject(error);
             console.log(`You have encountered an error: ${error}`)
     });
        });
     };


     const grabShowtimes = (loc) => {
        const theatreData = {};
        const movieNames = {};
        return new Promise((resolve, reject) => {
              $.get(encodeURL(dateNow, loc, radius)).then(res => {
             let data;
             console.log('api data fetched');
             res.map(data => {
                 movieNames[data.title] = [];
                 data.showtimes.forEach(movie => {
                     movieNames[data.title].push(moment(movie.dateTime).format('MMMM Do, YYYY hh:mm a'));
                     theatreData[movie.theatre.name] = movieNames;
                     
                 });
            })
             resolve(theatreData);
         })
         .catch(error => {
             reject(error);
             console.log(`You have encountered an error: ${error}`)
     });
        });
    };

        



// user + uid + restaurants . restaurant.Lat, restaurant.Long

// dateTime: "2019-02-02T12:20"


//http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-02-02&lat=35.851000&lng=-78.796130&api_key=7dadpsd62b4jwc7a92arb7fb

//http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-02-02&zip=27517&api_key=//