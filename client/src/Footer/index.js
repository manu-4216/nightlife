import React, { Component } from 'react';
import './style.css'

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleFooter: true
        };
    }

    componentDidMount() {
        let visibleFooter;

        window.onscroll = (e => {
            // Detect if on top
            if (document.body.scrollTop === 0) {
                visibleFooter = true;
            // Detect if on bottom
            } else if ((window.innerHeight + window.scrollY + 1) >= document.body.scrollHeight) {
                visibleFooter = true;
            } else {
                visibleFooter = false;
            }

            this.setState({
                visibleFooter
            })
        })
    }

    render() {
        return (
            <div className="Footer">
                {this.state.visibleFooter &&
                    <div className="Footer-yelp-info">
                        This app uses YELP API to get information about places
                    </div>
                }
            </div>
            )
        }
    }


export default Footer;
