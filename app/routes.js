const express = require('express')
const path = require('path')

const cachedToken = {
    value: '',
    expirationDate: 0
}
const yelp = require('yelp-fusion')

module.exports = function(app, passport) {



    //*******************************
    // Authentification endpoints  **
    //*******************************
    app.get('/login', function (req, res) {
        console.log('  >>> LOGIN')
        res.render('app/views/login.ejs', { message: req.flash('loginMessage') })
    })
    app.get('/login', function (req, res) {
        console.log('  >>> LOGIN redirect', req.params)

        res.render('app/views/login.ejs', { message: req.flash('loginMessage') })
    })
    // process the login form
    /*
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }))
    */

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                return next(err)
            }
            // Redirect if it fails
            if (!user) {
                return res.redirect('/login')
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err)
                }
                // Redirect if it succeeds
                var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/'
                delete req.session.redirectTo
                return res.redirect(redirectTo)
            });
        })(req, res, next);
    });


    app.get('/signup', function (req, res) {
        console.log(' >>> SIGNUP')
        res.render('app/views/signup.ejs', { message: req.flash('signupMessage') })
    })
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }))


    app.get('/logout', function (req, res) {
        console.log(' >>> LOGOUT')
        req.logout() // provided by passport
        req.redirect('/')
    })

    app.get('/gotoggle*', function (req, res) {
        console.log(' >>> gotoggle')
        if (req.isAuthenticated()) {
            res.send({ auth: true})
        } else {
            req.session.redirectTo = '/search?location=' + req.query.location;
            res.send({ auth: false })
        }
    })

    // Make server call to YELP API to get the 'nightlife' places around a place
    app.get('/api/search', function (req, res) {
        console.log(' >>> api search')
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

                return {
                    id: place.id,
                    name: place.name,
                    rating: place.rating,
                    image_url: place.image_url,
                    url: place.url,
                    categories: place.categories,
                    address: place.location.address1,
                    city: place.location.city,
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


    // Main home Route
    app.get('/*', (req, res) => {
        console.log(' >>> HOME')
        res.sendFile(path.join(__dirname, '../client/build/index.html'))
    })


}


/**
 * Route middleware to check if user is loggedin
 */
function isLoggedIn (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next()
    }
    // if they aren't redirect them to the home page
    res.redirect('/')
}

/**
 * Get once the Yelp access token, then caches it in memory, to speed up the next API calls
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
