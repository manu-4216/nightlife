const express = require('express')
const app = express()
require('dotenv').config()
const yelp = require('yelp-fusion')
const cachedToken = {
    value: '',
    expirationDate: 0
}

const bodyParser = require('body-parser')

app.set("port", process.env.PORT || 3001)


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))
}

/**
 * Caches the token, to speed up the next YELP API calls
 */
function getToken() {
    if (cachedToken.value && cachedToken.expirationDate && Date.now()/1000 < cachedToken.expirationDate) {
        return Promise.resolve(cachedToken.value)
    } else {
        // Get new token:
        return yelp.accessToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
        .then(response => {
            cachedToken.value = response.jsonBody.access_token
            cachedToken.expirationDate = Date.now() + response.jsonBody.expires_in
            return Promise.resolve(cachedToken.value)
        })
        .catch(error => {
            return Promise.reject(error)
        })
    }
}

// Make server call to YELP API to get the 'nightlife' places around a place
app.get('/search', function (req, res) {
    var location = decodeURIComponent(req.query.location).toLowerCase()

    getToken()
    .then(token => {
        return yelp.client(token).search({
            location: location,
            //categories: 'nightlife'
            categories: 'bars'
        })
    })
    .then(response => {
        let usefulData = response.jsonBody.businesses.map(place => {
            // Display the city in the address, if it's different that the input city
            let cityIfDifferent = (location === place.location.city.toLowerCase()) ? '' : ', ' + place.location.city;

            return {
                id: place.id,
                name: place.name,
                rating: place.rating,
                image_url: place.image_url,
                url: place.url,
                categories: place.categories,
                address: place.location.address1 + cityIfDifferent,
                display_phone: place.display_phone
            }
        });

        //console.log('Sample data: ', usefulData[0])
        res.json(usefulData)

    })
    .catch(function (error) {
        var errorMessage;

        console.log(error)
        try {
            errorMessage = JSON.parse(error.response.body).error.description
        } catch (e) {
            errorMessage = 'Error while fetching Yelp places.'
        }

        res.status(400).send(errorMessage)
    });

})

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`)
})
