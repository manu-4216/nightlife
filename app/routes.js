const express = require('express');
const path = require('path');
const Users = require('./models/user');
const Places = require('./models/places');

const cachedToken = {
    value: '',
    expirationDate: 0
};
const yelp = require('yelp-fusion');
const apiKey = process.env.API_KEY;

module.exports = function(app, passport) {
    //*******************************
    // Authentification endpoints  **
    //*******************************
    app.get('/login', function(req, res) {
        if (req.query.location) {
            req.session.redirectTo = '/search?location=' + req.query.location;
        }
        res.render('app/views/login.ejs', {
            message: req.flash('loginMessage')
        });
    });
    app.get('/login', function(req, res) {
        res.render('app/views/login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err);
            }
            // Redirect if it fails
            if (!user) {
                return res.redirect('/login');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                // Redirect if it succeeds
                var redirectTo = req.session.redirectTo
                    ? req.session.redirectTo
                    : '/';
                delete req.session.redirectTo;
                return res.redirect(redirectTo);
            });
        })(req, res, next);
    });

    app.get('/signup', function(req, res) {
        res.render('app/views/signup.ejs', {
            message: req.flash('signupMessage')
        });
    });
    // process the signup form
    app.post(
        '/signup',
        passport.authenticate('local-signup', {
            successRedirect: '/', // redirect to the secure profile section
            failureRedirect: '/signup', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        })
    );

    app.get('/logout', function(req, res) {
        req.logout(); // provided by passport
        res.redirect('/');
    });

    app.get('/api/gotoggle*', function(req, res) {
        const placeId = req.query.placeid;

        if (req.isAuthenticated()) {
            Users.findById(req.user._id)
                .then(user => {
                    var positionInUserPlaces = user.places.indexOf(placeId),
                        userIsGoing = positionInUserPlaces > -1;

                    if (positionInUserPlaces === -1) {
                        user.places.push(placeId); // add the element
                        // Places.findOne ...
                    } else {
                        user.places.splice(positionInUserPlaces, 1); // remove the element
                    }

                    user.save(function(err) {
                        if (err) {
                            console.log('err', err);
                        }
                    });

                    //**************************************************

                    Places.findOne({ id: placeId })
                        .then(place => {
                            if (!place) {
                                newPlace = new Places();
                                newPlace.id = placeId;
                                newPlace.usersCount = 1;
                                newPlace.save(function(err) {
                                    if (err) {
                                        console.log('err', err);
                                    }
                                });
                            } else {
                                if (!userIsGoing) {
                                    place.usersCount += 1;
                                } else {
                                    place.usersCount -= 1;
                                }
                                place.save(function(err) {
                                    if (err) {
                                        console.log('err', err);
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    //********************************************************
                    res.send({ auth: true });
                })
                .catch(err => {
                    console.log(err);
                    res.send({ auth: false });
                });
        } else {
            req.session.redirectTo = '/search?location=' + req.query.location;
            res.send({ auth: false });
        }
    });

    // Make server call to YELP API to get the 'nightlife' places around a place
    app.get('/api/search', function(req, res) {
        var location = decodeURIComponent(req.query.location).toLowerCase();
        var completePlacesData = [];

        return (
            yelp
                .client(apiKey)
                .search({
                    location: location,
                    categories: 'bars'
                })
                .then(response => {
                    completePlacesData = response.jsonBody.businesses.map(
                        place => {
                            return {
                                id: place.id,
                                name: place.name,
                                rating: place.rating,
                                image_url: place.image_url,
                                url: place.url,
                                categories: place.categories,
                                address: place.location.address1,
                                city: place.location.city,
                                display_phone: place.display_phone,
                                userIsGoing: req.user
                                    ? req.user.places.indexOf(place.id) > -1
                                    : 0
                            };
                        }
                    );

                    return completePlacesData;
                })
                .then(placesData => {
                    const placesId = placesData.map(place => place.id);

                    return getUsersCountList(placesId);
                })
                // Add 'usersCount' property for each place
                .then(usersCountList => {
                    usersCountList.forEach((usersCount, index) => {
                        completePlacesData[index].usersCount = usersCount;
                    });

                    // console.log('completePlacesData', completePlacesData[0]);
                    res.json(completePlacesData);
                })
                .catch(function(error) {
                    var errorMessage;

                    console.log(error);

                    try {
                        errorMessage = JSON.parse(error.response.body).error
                            .description;
                    } catch (e) {
                        errorMessage = 'Error while fetching Yelp places.';
                    }

                    res.status(400).send(errorMessage);
                })
        );
    });

    app.get('/api/isloggedin', (req, res) => {
        res.send({ auth: req.isAuthenticated() });
    });

    // Main home Route
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
};

/**
 * Route middleware to check if user is loggedin
 */
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function getUsersCountList(placesId) {
    var getUsersCountListPromises = placesId.map((placeId, index) => {
        return new Promise((resolve, reject) => {
            // do db access with placeId
            Places.findOne({ id: placeId })
                .then(place => {
                    if (!place) {
                        place.usersCount = 0;
                        resolve(0);
                    }

                    resolve(place.usersCount);
                })
                .catch(err => {
                    resolve(0);
                });
        });
    });
    return Promise.all(getUsersCountListPromises);
}
