import React, { Component } from "react";
import "./clock.css";
export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hours: "00",
            minutes: "00",
            seconds: "00"
        }
    }
    componentDidMount() {
        this.timerID = setInterval(
            () => this.updateTime(),
            100
        );
    }
    updateTime() {
        let date = new Date();
        // date.setMinutes(date.getMinutes() + this.props.timezoneOffsetMinutes);
        let hours = date.getHours();
        if (hours < 10) hours = "0" + hours;
        let minutes = date.getMinutes();
        if (minutes < 10) minutes = "0" + minutes;
        let seconds = date.getSeconds();
        if (seconds < 10) seconds = "0" + seconds;
        this.setState({"hours": hours, "minutes": minutes, "seconds": seconds});
        // setTimeout(this.updateTime, 100);
    }
    render() {
        return (
            <div className={"clockComponent"}>
                { this.state.hours }:{ this.state.minutes }:{ this.state.seconds } 
            </div>
        );
    }
}
