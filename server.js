const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const passport = require('passport')
const flash    = require('connect-flash')
const bodyParser = require('body-parser')
const morgan       = require('morgan')
const cookieParser = require('cookie-parser')
const session      = require('express-session')

// configuration ===============================================================
mongoose.connect(process.env.MONGO_URL) // connect to our database


// require('./config/passport')(passport); // pass passport for configuration


// set up our express application
app.use(morgan('dev')) // log every request to the console
app.use(cookieParser()) // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json()) // get information from html forms

app.set('view engine', 'ejs') // set up ejs for templating
app.set("port", process.env.PORT || 3001)

// required for passport
app.use(session({
    secret: 'singularityscoming',
    proxy: true,
    resave: true,
    saveUninitialized: true
})) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use connect-flash for flash messages stored in session

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))
}

// routes ======================================================================
require('./app/routes.js')(app, passport) // load our routes and pass in our app and fully configured passport


// launch ======================================================================
app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`)
})
