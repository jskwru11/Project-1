
    const APIKEY = '7dadpsd62b4jwc7a92arb7fb';


    let baseUrl = 'http://data.tmsapi.com/v1.1/movies/showings?';
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
        let theatreNames = [];
        
        $.get(encodeURL(dateNow, loc, radius)).then(res => {
            console.log('api data fetched');
            // console.log(res)
            res.map(results => {
                results.showtimes.map(theatre => {
                    if (theatreNames.indexOf(theatre.theatre.name) === -1) {
                        theatreNames.push(theatre.theatre.name)
                    }
                    
                });

                console.log(theatreNames);
                return theatreNames;
            })
        }).catch(error => {
            console.log(`You have encountered an error: ${error}`)
        })
    };
    
    $('#clickMe').on('click', getData);

    const newDate = moment("2019-02-02T10:45").format('MMMM Do, YYYY hh:mm a');
    console.log(newDate);

// user + uid + restaurants . restaurant.Lat, restaurant.Long

// dateTime: "2019-02-02T12:20"


//http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-02-02&lat=35.851000&lng=-78.796130&api_key=7dadpsd62b4jwc7a92arb7fb

//http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-02-02&zip=27517&api_key=//