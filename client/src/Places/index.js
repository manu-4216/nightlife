import React from 'react'
import './style.css'
import stamp from '../stamp.png';
import location from '../location.svg';
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const Places = props =>

<div>
{ props.places.length !== 0 &&

    <ul className="Places">
        {
            props.places.map((place, index) => (
                <li key={index}>
                    <img src={place.image_url || "#"} className="Places-image" alt="" />

                    <div className="Places-info-right-container">
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
                                <span className="Places-phone-symbol">☎</span>
                                <a href={'tel:' + place.display_phone || '#'} target="_blank">{place.display_phone || '-'}</a>
                            </div>

                            <div className="Places-address">
                                <img src={location} className="Places-location" alt="" />
                                <a href={"https://maps.google.com/?q=" + place.address + ', ' + place.city} title="Click to open in Maps" target="_blank">
                                    {place.address + ((props.location.toLowerCase() === place.city.toLowerCase()) ? '' : ', ' + place.city)}
                                </a>
                            </div>

                            <div className="Places-actions">
                                {place.goingCount} going
                                <button
                                    className={'Places-action-go' + (place.userIsGoing ? ' deactivate' : ' activate')}
                                    title={place.userIsGoing ? "Cancel going" : "Add me"}
                                    onClick={props.handleToggleGoing.bind(null, index)}>
                                    {place.userIsGoing ? '-' : '+'}
                                </button>
                            </div>

                            <ReactCSSTransitionGroup
                                    transitionName="anim"
                                    transitionEnterTimeout={300}
                                    transitionLeaveTimeout={300}>
                                    {place.userIsGoing &&
                                        <img className="Places-stamp" src={stamp} alt="" />
                                    }
                            </ReactCSSTransitionGroup>

                        </div>
                    </div>
                </li>
            ))
        }
    </ul>
}

</div>

export default Places;
