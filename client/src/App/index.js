import React, { Component } from 'react';
import logo from '../logo.png';
import './style.css';
import Header from '../Header/index';
import Content from '../Content/index';
import Footer from '../Footer/index';

class App extends Component {

    render() {
        return (
            <div className="App">
                <Header logo={logo} loggedIn={false} />

                <Content />

                <Footer />

            </div>
        );
    }
}

export default App;
