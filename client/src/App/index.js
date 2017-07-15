import React, { Component } from 'react';
import logo from '../logo.png';
import './style.css';
import Content from '../Content/index';
import Footer from '../Footer/index';

class App extends Component {

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2 className="App-title">Nightlife </h2>
                </div>

                <Content />
                
                <Footer />

            </div>
        );
    }
}

export default App;
