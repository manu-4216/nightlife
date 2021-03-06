import React, { Component } from 'react';
import './style.css';
import Places from '../Places/index';
const store = require('store');
const axios = require('axios');

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            location: '',
            places: [],
            errorMessage: '',
            loading: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // Detect direct link to a search query. Need to populate with the previous cached results (if any)
        const query = window.location.search,
            location = window.location.search.replace('?location=', '');

        this.searchInput.focus();

        if (query && location) {
            this.fetchResults(query, location);
        }

        this.setState({
            location: decodeURIComponent(location)
        });
    }

    render() {
        return (
            <div className="Content">
                <p className="Content-intro">
                    Explore <span className="nightlife">nightlife</span>{' '}
                    opportunities around you
                </p>

                <form className="Content-form" onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        ref={input => {
                            this.searchInput = input;
                        }}
                        placeholder="Enter your location"
                        autoComplete="off"
                        name="location"
                        value={this.state.location}
                        onChange={this.handleChange}
                    />
                    <input type="submit" value="Search" />
                </form>

                {this.state.errorMessage && (
                    <div className="Content-error-message">
                        {this.state.errorMessage}
                    </div>
                )}

                {this.state.loading ? (
                    <div className="Content-loading">Loading...</div>
                ) : (
                    <Places
                        location={this.state.location}
                        places={this.state.places}
                        handleToggleGoing={this.toggleGoing.bind(this)}
                    />
                )}
            </div>
        );
    }

    // Event handlers
    //********************************
    handleChange(event) {
        this.setState({
            location: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const location = encodeURIComponent(this.state.location.trim());

        window.history.pushState(location, '', '/search?location=' + location); // updates the URL
        this.fetchResults('', location);
    }

    toggleGoing(index) {
        // TODO: move this in ok cb
        const place = this.state.places[index];
        var that = this;

        axios
            .get(
                '/api/gotoggle' +
                    window.location.search +
                    '&placeid=' +
                    place.id
            )
            .then(data => {
                if (!data.data.auth) {
                    window.history.pushState(
                        'login',
                        '',
                        '/login' + window.location.search
                    );
                    window.location.reload();
                } else {
                    // Auth, so update
                    place.userIsGoing = !place.userIsGoing;
                    place.goingCount += place.userIsGoing ? 1 : -1;

                    // update state
                    that.setState({
                        places: this.state.places
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    // Helper methods
    //**********************************

    // Fetch the results from cache (if available) or network
    fetchResults(query, location) {
        let queryResult = '';

        // queryResult = store.get(location); // TEMPORARY dont use the cache
        if (queryResult) {
            this.setState({
                places: queryResult,
                errorMessage: '',
                location: decodeURIComponent(location)
            });
        } else {
            // No cache yet, so do the server fetch
            this.fetchResultsFromNetwork(location);
        }
    }

    // Gets the results from the server
    // Used 1) after a form submition or 2) by direct URL access with a query in the URL
    fetchResultsFromNetwork(location) {
        const url = '/api/search?location=' + location;

        this.setState({
            loading: true
        });

        axios
            .get(url)
            .then(response => {
                // Add the votes artificially (for now)
                response.data.forEach((place, index) => {
                    place.goingCount = place.usersCount;
                    place.userIsGoing = place.userIsGoing; // for now
                });

                this.setState({
                    places: response.data,
                    errorMessage: '',
                    loading: false
                });

                // Cache the result, in localStorage, for later use
                store.set(location, response.data);
            })
            .catch(error => {
                this.setState({
                    places: [],
                    errorMessage:
                        (error.response && error.response.data) ||
                        'Unknown error',
                    loading: false
                });
            });
    }
}

export default Content;
