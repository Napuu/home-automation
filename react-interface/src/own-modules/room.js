import React, {Component} from 'react';
import "./room.css";
import Slider from "rc-slider";
import Switch from 'react-toggle-switch'
import io from 'socket.io-client';
import "../../node_modules/react-toggle-switch/dist/css/switch.min.css" 
const socket = io(":35639");
export default class extends Component {
    constructor(props) {
        super(props);
        this.interruptBroadcast = this.interruptBroadcast.bind(this);
        this.endInterruptBroadcast = this.endInterruptBroadcast.bind(this);
        this.state = {
            styles: [{
                borderColor: 'gray',
                height: 20,
                width: 20,
                marginLeft: -10,
                marginTop: -8,
                backgroundColor: 'brown',
            }],
            //this step of storing each value individuallu is not really necessary
            //data is already at "correct" usable form straight from socket
            //however it's more straightforward to change it like this from react-side
            on0: 1,
            on1: 1,
            bri2: 200,
            ct2: 200,
            on2: 1,
            bri3: 200,
            ct3: 200,
            on3: 1,
            on6: 0,
            time6: "00:00",
            timer_on6: 0,
            on7: 0,
            listeningBroadcast: 0,
            deviceStatus: {}

        };
        socket.on("status", (data) => {
            if (this.state.listeningBroadcast < 3) {
                if (this.state.listeningBroadcast > -1) {
                    this.setState({"listeningBroadcast": this.state.listeningBroadcast + 1});
                }
                return;
            }
            for (let i = 0; i < 20; i++) {
                if (i in data) {
                    let newThings = {}
                    for (let key in data[i]) {
                        newThings[key + i] = data[i][key];
                    }
                    if (newThings["on" + i] === 0) {
                        newThings["bri" + i] = -1;
                    }
                    this.setState(newThings);
                }
            }
        });
    }
    // do not listen to broadcast while moving sliders
    interruptBroadcast(val) {
        this.setState({listeningBroadcast: -1});
    }
    endInterruptBroadcast() {
        this.setState({listeningBroadcast: 0})
    }
    render() {
        return (
            <div className={"roomComponent"} onMouseDown={this.interruptBroadcast} onMouseUp={this.endInterruptBroadcast}>
                <div className="row1 label">Katto</div>
                <CustomSlider mode={"bri"} row={1}styleID={0} target={3} that={this} />
                <CustomSlider mode={"ct"} row={1} styleID={0} target={3} that={this} />

                <div className="row2 label">Pöytä</div>
                <CustomSlider mode={"bri"} row={2} styleID={0} target={2} that={this} />
                <CustomSlider mode={"ct"} row={2} styleID={0} target={2} that={this} />

                <div className="row3 label">Työ</div>
                <CustomSwitch target={7} mode={"on"} row={3} that={this}/>
                <div className="row3 coffeeLabel">Kahvi</div>
                <CustomTime className="row3 coffeeTime" that={this}/>
                <CustomSwitch class="timerSwitch" row={3} target={6} mode={"timer_on"} that={this}/>
                <CustomSwitch class="coffeeSwitch" row={3} target={6} mode={"on"}  that={this}/>
                <button className="row4 allOffButton" onClick={() => {
                    socket.emit("accessory", {target: 7, mode: "on", value: 0});
                    socket.emit("accessory", {target: 2, mode: "on", value: 0});
                    socket.emit("accessory", {target: 3, mode: "on", value: 0});
                }}>Kaikki pois</button>

                <button className="row4 allSomethingButton" onClick={() => {
                    socket.emit("accessory", {target: 7, mode: "on", value: 0});
                    socket.emit("accessory", {target: 2, mode: "on", value: 1});
                    socket.emit("accessory", {target: 2, mode: "bri", value: 254});
                    socket.emit("accessory", {target: 2, mode: "ct", value: 454});
                    socket.emit("accessory", {target: 3, mode: "on", value: 1});
                    socket.emit("accessory", {target: 3, mode: "bri", value: 50});
                    socket.emit("accessory", {target: 3, mode: "ct", value: 454});
                }}>30%</button>

                <button className="row4 fullBlastButton" onClick={() => {
                    socket.emit("accessory", {target: 7, mode: "on", value: 1});
                    socket.emit("accessory", {target: 2, mode: "on", value: 1});
                    socket.emit("accessory", {target: 2, mode: "bri", value: 254});
                    socket.emit("accessory", {target: 2, mode: "ct", value: 253});
                    socket.emit("accessory", {target: 3, mode: "on", value: 1});
                    socket.emit("accessory", {target: 3, mode: "bri", value: 254});
                    socket.emit("accessory", {target: 3, mode: "ct", value: 254});
                }}>100%</button>
            </div>
        );
    }
}

class CustomTime extends React.Component {
    constructor(props) {
        super(props);
        this.changed = this.changed.bind(this);
    }
    changed(evt) {
        this.props.that.setState({"time6": evt.target.value});
        socket.emit("accessory", {target: 6, mode: "time", value: evt.target.value});
    }
    render() {
        return(
            <input className={this.props.className} onChange={this.changed} value={this.props.that.state["time6"]} type="time"/>
        );
    }
}
class CustomSwitch extends React.Component {
    constructor(props) {
        super(props);
        this.clicked = this.clicked.bind(this);
        let className = "row" + props.row;
        if (props.class !== undefined) className += " " + props.class + " ";
        else className += " left ";
        this.state = {
            switched: true,
            class: className + props.row
        }
    }
    clicked() {
        let onInt = (!this.props.that.state[this.props.mode + this.props.target]) ? 1 : 0;
        let newState = {};
        newState[this.props.mode + this.props.target] = onInt;
        this.props.that.setState(newState);
        socket.emit("accessory", {target: this.props.target, mode: this.props.mode, value: onInt});
    }
    render() {
        return(
            <Switch className={this.state.class} on={(this.props.that.state[this.props.mode + this.props.target]) ? true : false} onClick={this.clicked}/>
        );
    }
}
class CustomSlider extends React.Component {
    constructor(props) {
        super(props);
        let index = {"bri": 0, "ct": 1};
        let modeID = index[props.mode];
        let classes = "";
        if (props.mode === "bri") classes += "left";
        else if (props.mode === "ct") classes += "right";
        classes += " row" + props.row;
        this.changed = this.changed.bind(this);
        this.state = {
            min: [-1, 153][modeID],
            max: [254, 454][modeID],
            class: classes,
            style: [{
                borderColor: 'gray',
                height: 20,
                width: 20,
                marginLeft: -10,
                marginTop: -8,
                backgroundColor: 'brown',
            }][props.styleID],
        }
    } 
    changed(value) {
        let data = {target: this.props.target, mode: this.props.mode, value: value}
        socket.emit("accessory", data);
    }
    render() {
        return(
            <Slider 
                min={this.state.min} 
                max={this.state.max} 
                value={this.props.that.state[this.props.mode + this.props.target]} 
                className={this.state.class}
                onChange={(val) => {
                    let mode = this.props.mode + this.props.target;
                    let newState = {}
                    newState[mode] = val;
                    this.props.that.setState(newState);
                }}
                handleStyle={this.state.style}
                onAfterChange={this.changed}
            />
        );
    }
}
