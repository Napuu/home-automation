import React, {Component} from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('192.168.1.122:35639');

var allData = {};

socket.on('status', data => {
  allData = data;
});
let Button = props => {
  let classes = 'block';
  if (props.additionalClass !== undefined)
    classes += ' ' + props.additionalClass;
  return (
    <button
      className={classes}
      onTouchStart={ev => {
        props.packets.forEach(packet => {
          socket.emit('accessory', {
            target: packet.target,
            mode: packet.mode,
            value: packet.value,
          });
        });
      }}>
      {props.text}
    </button>
  );
};

let OnOffButton = props => {
  return (
    <div className="blockHolder">
      <Button packets={props.onPackets} text="ON" />
      <Button packets={props.offPackets} text="OFF" />
      <div className="blockLabel">{props.text}</div>
    </div>
  );
};
let OnOffDimButton = props => {
  let packetGroups = [
    {text: 0, packets: [{target: props.target, mode: 'on', value: 0}]},
    {
      text: 25,
      packets: [
        {target: props.target, mode: 'on', value: 1},
        {target: props.target, mode: 'bri', value: 64},
      ],
    },
    {
      text: 50,
      packets: [
        {target: props.target, mode: 'on', value: 1},
        {target: props.target, mode: 'bri', value: 128},
      ],
    },
    {
      text: 75,
      packets: [
        {target: props.target, mode: 'on', value: 1},
        {target: props.target, mode: 'bri', value: 191},
      ],
    },
    {
      text: 100,
      packets: [
        {target: props.target, mode: 'on', value: 1},
        {target: props.target, mode: 'bri', value: 254},
      ],
    },
  ].reverse();
  let elements = packetGroups.map(group => {
    return (
      <Button
        additionalClass={'block5'}
        text={group.text}
        packets={group.packets}
      />
    );
  });
  elements.push(<div className="blockLabel">{props.text}</div>);
  return <div className="blockHolder">{elements}</div>;
};
class App extends Component {
  render() {
    return (
      <div className="App">
        <OnOffButton
          onPackets={[{target: 0, mode: 'on', value: 1}]}
          offPackets={[{target: 0, mode: 'on', value: 0}]}
          text={'valkoinen'}
        />
        <OnOffButton
          onPackets={[{target: 1, mode: 'on', value: 1}]}
          offPackets={[{target: 1, mode: 'on', value: 0}]}
          text={'pöytä'}
        />
        <OnOffDimButton target={2} text={'katto'} />
        <OnOffDimButton target={3} text={'katto'} />
      </div>
    );
  }
}

export default App;
