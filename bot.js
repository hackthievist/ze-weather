const twit = require('twit');
const config = require('./config');
const axios = require('axios');
const fs = require("fs");
const express = require('express');
const giphy = require("giphy-api")("ZLvtyD99u4EGLRzhSOyAAYzLiYsI0irW");
const http = require('http');
const https = require('https');

setInterval(() => {
    https.get('https://bibliotheque-mandarine-52484.herokuapp.com');
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
    axios
        .get(geocode)
        .then(response => {
            if (response.data.status === "ZERO_RESULTS") {
                throw new Error("Cannot fetch address");
            }

            var longitude = response.data.results[0].geometry.location.lng;
            var latitude = response.data.results[0].geometry.location.lat;
            var weatherURL = `https://api.darksky.net/forecast/705e8b979c6d5a233b82fef813c89447/${latitude},${longitude}`;

            return axios.get(weatherURL);
        })
        .then(response => {
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
                var statusGif = 'raining';
            } else if (summary === 'Drizzle') {
                var summaryList = ['It is just a little drizzle my nizzle', 'Drip Drop, a little drizzle'];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = 'snoop dogg nizzle';
            } else if (summary === 'Mostly Cloudy') {
                summaryList = ["It's a lot of clouds in the sky", 'Lots of clouds, it just might be the apocalypse'];
                var rand = dataCheck(summaryList);
                var statusGif = 'mostly Cloudy';
                summary = summaryList[rand];
            } else if (summary === 'Partly Cloudy') {
                summaryList = ["Cloudy with a chance of meatballs", 'The clouds are coming'];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = 'raining meatballs';
            } else if (summary === 'Humid and Overcast') {
                summaryList = ["It is humid (lol, humid)", "It is very humid for humans"];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = "humid";
            } else if (summary === 'Clear') {
                summaryList = ['Clear af', 'It is clear as day', 'Clearrrrrrr!'];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = 'Clear Sky';
            } else if (summary === 'Overcast') {
                summaryList = ["It's quite dull", 'The skies are gloomy'];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = 'Overcast Weather';
            } else if (summary === 'Humid and Mostly Cloudy') {
                summaryList = ["Get your umbrellas, it's about to get wet", 'The rain is coming', 'Hurry, find a shelter!'];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = 'mostly cloudy';
            } else if (summary === 'Humid and Partly Cloudy') {
                summaryList = ["Get ready for a bit of rain", 'Get an umbrella', 'The skies are heavy'];
                var rand = dataCheck(summaryList);
                summary = summaryList[rand];
                var statusGif = "partly cloudy";
            }

            var gifIndex = Math.floor(Math.random() * 10);

            giphy.search(statusGif, function (err, res) {
                var gifUrl = res.data[gifIndex].images.original.url;
                var gu = gifUrl.replace("https", "http");


                //working link - "http://media1.giphy.com/media/U2nN0ridM4lXy/200.gif"
                var file = fs.createWriteStream("./images/file.gif");
                var request = http.get(gu, function (response) {
                    response.pipe(file);
                });
            });

            var b64content = fs.readFileSync("./images/file.gif", {
                encoding: "base64"
            });


            // first we must post the media to Twitter
            Twitter.post(
                "media/upload", {
                    media_data: b64content
                },
                function (err, data, response) {
                    // now we can assign alt text to the media, for use by screen readers and
                    // other text-based presentations and interpreters
                    var mediaIdStr = data.media_id_string;
                    var altText = "reaction";
                    var meta_params = {
                        media_id: mediaIdStr,
                        alt_text: {
                            text: altText
                        }
                    };


                    Twitter.post("media/metadata/create", meta_params, function (
                        err,
                        data,
                        response
                    ) {
                        if (!err) {
                            // now we can reference the media and post a tweet (media will attach to the tweet)
                            var params = {
                                status: `It is currently ${celsiusTemp}°C in ${nigerianState} State. ${summary}`,
                                media_ids: [mediaIdStr]
                            };

                            Twitter.post("statuses/update", params, function (
                                err,
                                data,
                                response
                            ) {

                            });
                        } else {
                            console.log(err);
                        }
                    });
                }
            );
        })
        .catch(e => {});
};

tweetWeather();
setInterval(tweetWeather, 3600000);