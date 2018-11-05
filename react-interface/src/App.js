import React, { Component } from 'react';
import './App.css';
import Weather from "./own-modules/weather.js";
import Clock from "./own-modules/clock.js";
import Room from "./own-modules/room.js";

class App extends Component {
    render() {
        return (
               <div>
                    <Clock />
                    <Room />
                    <Weather place={this.props.place} />
               </div>
        );
    }
}

export default App;
