import React, { Component } from 'react'
import './style.css'

//var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const Places = props =>

<div>
{ props.places.length !== 0 &&

    <ul className="Places">
        {
            props.places.map((place, index) => (
                <li key={index}>
                    <div>{place.name}</div>
                </li>
            ))
        }
    </ul>
}

</div>

export default Places;
