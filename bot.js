const twit = require('twit');
const config = require('./config');
const axios = require('axios');
const fs = require('fs');
const express = require('express');

var app = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function (request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function () {
    console.log('App is running, server is listening on port ', app.get('port'));
});

var Twitter = new twit(config);

var states = [
    "Abia",
    "Adamawa",
    "Anambra",
    "Akwa Ibom",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Enugu",
    "Edo",
    "Ekiti",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara"
];



var tweetWeather = () => {
    var rand = Math.floor(Math.random() * 36);
    var nigerianState = states[rand];
    var encodedAddress = encodeURIComponent(nigerianState + ', Nigeria');
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
        Twitter.post('statuses/update', {
            status: `It is currently ${celsiusTemp}°C in ${nigerianState} State`
        }, (err, data, response) => {});
    }).catch((e) => {});
}

tweetWeather();
setInterval(tweetWeather, 10000);