const twit = require('twit');
const config = require('./config');
const axios = require('axios');
const express = require('express');
const https = require('https');

setInterval(() => {
    https.get('http://bibliotheque-mandarine-52484.herokuapp.com');
}, 1800000) //every 30 minutes

var app = express();

app.set('port', (process.env.PORT || 5000));

//For avoiding Heroku $PORT error
app.get('/', function (request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function () {
    console.log('App is running, server is listening on port ', app.get('port'));
});

var Twitter = new twit(config);

var rain = ["It's currently raining"];
var cloudy = ["It's currently cloudy"];

var states = ["Abia", "Adamawa", "Anambra", "Akwa Ibom", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
    "Delta", "Ebonyi", "Enugu", "Edo", "Ekiti", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna",
    "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

var tweetWeather = () => {
    var rand = Math.floor(Math.random() * 36);
    var nigerianState = states[rand];
    var encodedAddress = encodeURIComponent(`${nigerianState}, Nigeria`);
    var geocode = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;
    axios.get(geocode).then((response) => {
        if (response.data.status === 'ZERO_RESULTS') {
            throw new Error('Cannot fetch address');
        }

        var longitude = response.data.results[0].geometry.location.lng;
        var latitude = response.data.results[0].geometry.location.lat;
        var weatherURL = `https://api.darksky.net/forecast/705e8b979c6d5a233b82fef813c89447/${latitude},${longitude}`;

        return axios.get(weatherURL);
    }).then((response) => {
        var fahrTemp = response.data.currently.temperature;
        var celsiusTemp = ((fahrTemp - 32) * (5 / 9)).toFixed(1);

        var summary = response.data.currently.summary;

        var dataCheck = (arr) => {
            var rand = Math.floor(Math.random() * arr.length);
            return rand;
        }

        if (summary === 'Light Rain') {
            var summaryList = ["It is just a little rain, nothing serious", "It is just a bit of rain, something light",
                'Raindrops, Droptop!'
            ];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Drizzle') {
            var summaryList = ['It is just a little drizzle my nizzle', 'Drip Drop, a little drizzle'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Mostly Cloudy') {
            summaryList = ["It's a lot of clouds in the sky", 'Lots of clouds, it just might be the apocalypse'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Partly Cloudy') {
            summaryList = ["Cloudy with a chance of meatballs", 'The clouds are coming'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Humid and Overcast') {
            summaryList = ["It is humid (lol, humid)", "It is very humid for humans"];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Clear') {
            summaryList = ['Clear af', 'It is clear as day', 'Clearrrrrrr!'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Overcast') {
            summaryList = ["It's quite dull", 'The skies are gloomy'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Humid and Mostly Cloudy') {
            summaryList = ["Get your umbrellas, it's about to get wet", 'The rain is coming', 'Hurry, find a shelter!'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        } else if (summary === 'Humid and Partly Cloudy') {
            summaryList = ["Get ready for a bit of rain", 'Get an umbrella', 'The skies are heavy'];
            var rand = dataCheck(summaryList);
            summary = summaryList[rand];
        }

        console.log(`It is currently ${celsiusTemp}°C in ${nigerianState} State. ${summary}!`);

        Twitter.post('statuses/update', {
            status: `It is currently ${celsiusTemp}°C in ${nigerianState} State. ${summary}!`
        }, (err, data, response) => {});

    }).catch((e) => {});
}

tweetWeather(); //3600000
setInterval(tweetWeather, 10000);