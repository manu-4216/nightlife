const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// configuration ===============================================================
mongoose
  .connect(process.env.MONGO_URL) // connect to our database
  .then()
  .catch((err) => {
    console.log('DB connection error: ', err);
  });

require('./app/config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.set('views', __dirname + '/');
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('port', process.env.PORT || 3000);

// Express only serves static assets in production
app.use(express.static(path.join(__dirname, 'client/build')));

// required for passport
app.use(
  session({
    secret: 'singularityscoming',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// 404: Not found
app.use(function (req, res, next) {
  res.status(404).json({ ERROR: 'Page not found.' });
});

// launch ======================================================================
app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});
