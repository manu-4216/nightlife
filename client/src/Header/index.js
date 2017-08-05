import React, { Component } from 'react';
import './style.css';
const axios = require('axios');

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false
        };
    }

    componentDidMount() {
        var loggedIn;

        axios.get('/api/isloggedin')
        .then(data => {
            loggedIn = data.data.auth;
            this.setState({loggedIn});
        })
        .catch(err => {
            loggedIn = false;
            this.setState({loggedIn});
        })
    }

    login() {
        window.history.pushState('login', '', '/login' + window.location.search);
        window.location.reload();
    }

    logout() {
        window.history.pushState('logout', '', '/logout' + window.location.search);
        window.location.reload();
    }

    render() {
        return (

            <div className="Header">
                <img src={this.props.logo} className="Header-logo" alt="logo" />
                <h2 className="Header-title">Nightlife </h2>
                <span
                    className="Header-login"
                    onClick={this.state.loggedIn ? this.logout : this.login }>
                    {this.state.loggedIn ? 'Logout' : 'Login'}
                </span>
            </div>

            )
        }
    }


export default Header;
