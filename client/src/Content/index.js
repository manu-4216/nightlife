import React, { Component } from 'react'
import './style.css'
import Places from '../Places/index';
const axios = require('axios')


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

    handleChange(event) {
        this.setState({
            location: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        let url = '/api/search?location=' + encodeURIComponent(this.state.location);

        this.setState({
            loading: true
        })

        axios.get(url)
        .then(response => {
            this.setState({
                places: response.data,
                errorMessage: '',
                loading: false
            })
        })
        .catch(error => {
            this.setState({
                places: [],
                errorMessage: error.response.data || 'Unknown error',
                loading: false
            })
        })
    }

    componentDidMount() {
        this.searchInput.focus();
    }

    render() {
        return (
            <div className="Content">
                <p className="Content-intro">Explore <span className="nightlife">nightlife</span> opportunities around you</p>

                <form className="Content-form" onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        ref={(input) => { this.searchInput = input; }}
                        placeholder="Enter your location"
                        autoComplete="off"
                        name="location"
                        value={this.state.location}
                        onChange={this.handleChange} />
                    <input type="submit" value="Search" />
                </form>

                { this.state.errorMessage &&
                <div className="Content-error-message">{this.state.errorMessage}</div>
                }

                { this.state.loading ?
                    <div className="Content-loading">Loading...</div> :

                    <Places places={this.state.places} />
                }

            </div>
        );
    }
}

export default Content;
