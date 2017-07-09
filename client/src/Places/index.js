import React, { Component } from 'react'
import './style.css'
import location from '../location.svg';

//var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const Places = props =>

<div>
{ props.places.length !== 0 &&

    <ul className="Places">
        {
            props.places.map((place, index) => (
                <li key={index}>
                    <img src={place.image_url || "#"} className="Places-image" alt="" />

                    <div className="Places-info-right">
                        <div className="Places-title">
                            <a href={place.url} target="_blank">{place.name}</a>
                            <span className="Places-rating">
                                {place.rating}
                                <span className="Places-star">★</span>
                            </span>
                        </div>

                        <div className="Places-categories">
                            {place.categories &&
                                <span>
                                    {place.categories.map((category, index) => (
                                        <span key={index}>{category.title}</span>
                                    ))}
                                </span>
                            }
                        </div>

                        <div className="Places-phone">
                            ☎
                            <a href={place.display_phone} target="_blank">{place.display_phone || '-'}</a>
                        </div>
                        <div className="Places-address">
                            <img src={location} className="Places-location" alt="" />
                            <a href={"https://maps.google.com/?q=" + place.address} title="Click to open in Maps" target="_blank">{place.address}</a>
                        </div>

                    </div>
                </li>
            ))
        }
    </ul>
}

</div>

export default Places;
