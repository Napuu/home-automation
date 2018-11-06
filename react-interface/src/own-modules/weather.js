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
        this.fetchLatestForecast = this.fetchLatestForecast.bind(this);
        this.state = {
            temp: 0,
            windDirection: 0,
            windSpeed: 0,
            relativeHumidity: 0,
            rain: 0
        };
    }
    componentDidMount() {
        this.fetchLatestForecast();
    }
    fetchLatestForecast() {
        fetch("http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::observations::weather::multipointcoverage&place=" + this.props.place)
        .then((resp) => resp.text())
        .then((resp) => {
            let observations = (getTag(resp, "gml:doubleOrNilReasonTupleList")).split("\n");
            let currentConditions = observations[observations.length - 2].trim().split(" ");
            if (currentConditions !== undefined) {
                this.setState({
                    temp: currentConditions[0],
                    windSpeed: currentConditions[1],
                    windDirection: currentConditions[3],
                    relativeHumidity: currentConditions[4],
                    rain: currentConditions[7]
                });
            }
            // fmi updates forecast every 5 minutes
            setTimeout(this.fetchLatestForecast, 1000*60*5);
        });
    }
    render() {
        return(
            <div className={"weatherContainer"} >
                <h1 className={"weatherContainerTitle"}>{this.props.place}</h1>
                <div className={"weatherPropContainer"}>
                    <img alt={"temperature_icon"} className={"weatherIcon"} src={temperature_icon} val={this.state.temp}/>
                    <div className={"weatherPropValue"}>
                        {this.state.temp} °C
                    </div>
                </div>
                <div className={"weatherPropContainer"}>
                    <img alt={"windSpeed_icon"} style={{transform: "rotate(" + (-90 - this.state.windDirection) + "deg)"}} className={"weatherIcon windSpeedIcon"} src={windSpeed_icon} val={this.state.windSpeed}/>
                    <div className={"weatherPropValue"}>
                        {this.state.windSpeed} m/s
                    </div>
                </div>
                <div className={"weatherPropContainer"}>
                    <img alt={"relativeHumidity_icon"} className={"weatherIcon"} src={relativeHumidity_icon} val={this.state.relativeHumidity}/>
                    <div className={"weatherPropValue"}>
                        {this.state.relativeHumidity}%
                    </div>
                </div>
                <div className={"weatherPropContainer"}>
                    <img alt={"rain_icon"} className={"weatherIcon"} src={rain_icon} val={this.state.rain}/>
                    <div className={"weatherPropValue"}>
                        {this.state.rain}mm/h
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
