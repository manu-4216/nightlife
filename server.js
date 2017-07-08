const express = require('express')
const app = express()
require('dotenv').config()
const yelp = require('yelp-fusion')

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

// Make server call to YELP API to get the 'nightlife' places around a place
app.post('/api/search', function (req, res) {
    console.log(req.body)

    yelp.accessToken(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
    .then(response => {
        const token = response.jsonBody.access_token;

        return yelp.client(token).search({
            location: 'paris',
            categories: 'nightlife'
        })
    })
    .then(response => {
        res.json(response.jsonBody)
    })
    .catch(function (error) {
        console.log('Error while fetching Yelp places. ', error)
        res.send(error)
    });

})

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`)
})
