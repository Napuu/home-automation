import React, { Component } from 'react';

import 'rc-slider/assets/index.css';
import './weather.css';

import temperature_icon from "./icons/noun_temperature.png";
import windSpeed_icon from "./icons/noun_arrow.png";
import relativeHumidity_icon from "./icons/noun_relativeHumidity.png";
import rain_icon from "./icons/noun_rain.png";
export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forecast: "",
            forecastTimes: "",
            latestFetchMillis: 0
        };
    }
    componentDidMount() {
        console.log("weather mounted");
        // this.fetchLatestForecast();
        this.fetchLatestForecast();
        console.log("fetched");
        this.setState({"latestFetchMillis": new Date().getTime()});
        this.timerID = setInterval(
            () => {
                let dateNow = new Date().getTime();
                if ((new Date().getMinutes()) % 5 === 0 && dateNow - this.state.latestFetchMillis > 60*1000*4) {
                    console.log("fetching");
                    this.fetchLatestForecast();
                    this.setState({latestFetchMillis: dateNow});
                }
                console.log("not enough time has passed");
            },
            10000
        );
    }
    fetchLatestForecast() {
        fetch("http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::forecast::harmonie::hybrid::point::multipointcoverage&place=" + this.props.place)
        .then((resp) => resp.text())
        .then((resp) => {
            let observations = (getTag(resp, "gml:doubleOrNilReasonTupleList")).split("\n");
            let observationTimes = (getTag(resp, "gmlcov:positions")).split("\n");
            // let splittedObservations = [];
            for (let i = 0; i < observations.length; i++) {
                observations[i] = observations[i].trim().split(" ");
                observationTimes[i] = observationTimes[i].trim().split(" ")[3];
            }
            observations.pop();
            observations.shift();
            observationTimes.pop();
            observationTimes.shift()

            // console.log(observationTimes);
            // console.log(observations);
            this.setState({
                forecast: observations,
                forecastTimes: observationTimes,
                latestObservation: [],
                latestObservationTime: 0
            });
        });
        fetch("http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::observations::weather::multipointcoverage&place=" + this.props.place)
        .then((resp) => resp.text())
        .then((resp) => {
            let observations = (getTag(resp, "gml:doubleOrNilReasonTupleList")).split("\n");

            let currentConditions = observations[observations.length - 2].trim().split(" ");
            // console.log(currentConditions);
            let observationTimes = (getTag(resp, "gmlcov:positions")).split("\n");
            let latestObservationTime = observationTimes[observationTimes.length - 2].trim().split(" ")[3];
            this.setState({
                latestObservation: currentConditions,
                latestObservationTime: latestObservationTime
            });

        });
        console.log("fetching done");
    }
    render() {
        let temp = "-99999";
        let windSpeed = "0";
        let windDirection = 0;
        let relativeHumidity = 0;
        let rain = 0;
        if (this.state.latestObservation !== undefined) {
            temp = this.state.latestObservation[0];
            windSpeed = this.state.latestObservation[1];
            windDirection = this.state.latestObservation[3];
            relativeHumidity = this.state.latestObservation[4];
            rain = this.state.latestObservation[7];
        }
        if (this.state.latestObservation === undefined) console.log("????")
        return(
            <div className={"weatherContainer"} >
                <h1 className={"weatherContainerTitle"}>{this.props.place}</h1>
                <div className={"weatherPropContainer"}>
                    <img alt={"temperature_icon"} className={"weatherIcon"} src={temperature_icon} val={temp}/>
                    <div className={"weatherPropValue"}>
                        {temp} °C
                    </div>
                </div>
                <div className={"weatherPropContainer"}>
                    <img alt={"windSpeed_icon"} style={{transform: "rotate(" + (-90 - windDirection) + "deg)"}} className={"weatherIcon windSpeedIcon"} src={windSpeed_icon} val={windSpeed}/>
                    <div className={"weatherPropValue"}>
                        {windSpeed} m/s
                    </div>
                </div>
                <div className={"weatherPropContainer"}>
                    <img alt={"relativeHumidity_icon"} className={"weatherIcon"} src={relativeHumidity_icon} val={relativeHumidity}/>
                    <div className={"weatherPropValue"}>
                        {relativeHumidity}%
                    </div>
                </div>
                <div className={"weatherPropContainer"}>
                    <img alt={"rain_icon"} className={"weatherIcon"} src={rain_icon} val={rain}/>
                    <div className={"weatherPropValue"}>
                        {rain}mm/h
                    </div>
                </div>
           </div>
        );
    }
}
function getTag(xml, tag) {
    let expr = new RegExp("<" + tag + ">(.|\n)*?</" + tag + ">");
    let text = xml.match(expr);
    text = text[0].substring(tag.length + 2, text[0].length - tag.length - 3);
    return text;
}
