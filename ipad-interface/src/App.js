import React, { Component } from "react";
import "./App.css";
import io from "socket.io-client";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import "./bootstrap.min.css";
const socket = io("192.168.1.122:35639");

let Button = props => {
  let classes = "block";
  if (props.additionalClass !== undefined)
    classes += " " + props.additionalClass;
  return (
    <div
      className={classes}
      onTouchMove={ev => {
        ev.preventDefault();
      }}
      onTouchStart={ev => {
        props.packets.forEach(packet => {
          socket.emit("accessory", {
            target: packet.target,
            mode: packet.mode,
            value: packet.value
          });
        });
      }}
    >
      {props.text}
    </div>
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
    { text: 0, packets: [{ target: props.target, mode: "on", value: 0 }] },
    {
      text: 25,
      packets: [
        { target: props.target, mode: "on", value: 1 },
        { target: props.target, mode: "bri", value: 64 }
      ]
    },
    {
      text: 50,
      packets: [
        { target: props.target, mode: "on", value: 1 },
        { target: props.target, mode: "bri", value: 128 }
      ]
    },
    {
      text: 75,
      packets: [
        { target: props.target, mode: "on", value: 1 },
        { target: props.target, mode: "bri", value: 191 }
      ]
    },
    {
      text: 100,
      packets: [
        { target: props.target, mode: "on", value: 1 },
        { target: props.target, mode: "bri", value: 254 }
      ]
    }
  ].reverse();
  let elements = packetGroups.map((group, index) => {
    return (
      <Button
        additionalClass={"block5"}
        text={group.text}
        packets={group.packets}
        key={new Date().getTime() + index}
      />
    );
  });
  elements.push(
    <div key={new Date().getTime() + 100} className="blockLabel">
      {props.text}
    </div>
  );
  return <div className="blockHolder">{elements}</div>;
};
let ModeButton = props => {
  return (
    <Button
      packets={props.packets}
      text={props.text}
      additionalClass="thiccBlock"
    />
  );
};
class App extends Component {
  render() {
    return (
      <div className="App">
        <Container fluid={true}>
          <Row>
            <Col>
              <ModeButton
                packets={[
                  { target: 0, mode: "on", value: 0 },
                  { target: 1, mode: "on", value: 0 },
                  { target: 2, mode: "on", value: 0 },
                  { target: 3, mode: "on", value: 0 }
                ]}
                text="1"
              />
            </Col>
            <Col>
              <ModeButton
                packets={[
                  { target: 0, mode: "on", value: 0 },
                  { target: 1, mode: "on", value: 0 },
                  { target: 2, mode: "on", value: 1 },
                  { target: 2, mode: "bri", value: 254 },
                  { target: 2, mode: "ct", value: 400 },
                  { target: 3, mode: "on", value: 1 },
                  { target: 3, mode: "bri", value: 51 },
                  { target: 3, mode: "ct", value: 400 }
                ]}
                text="2"
              />
            </Col>
            <Col>
              <ModeButton
                packets={[
                  { target: 0, mode: "on", value: 1 },
                  { target: 1, mode: "on", value: 1 },
                  { target: 2, mode: "on", value: 1 },
                  { target: 2, mode: "bri", value: 254 },
                  { target: 2, mode: "ct", value: 222 },
                  { target: 3, mode: "on", value: 1 },
                  { target: 3, mode: "bri", value: 254 },
                  { target: 3, mode: "ct", value: 222 }
                ]}
                text="3"
              />
            </Col>
          </Row>
          <Row className="midrow">
            <Col>
              <OnOffButton
                onPackets={[{ target: 8, mode: "on", value: 1 }]}
                offPackets={[{ target: 8, mode: "on", value: 0 }]}
                text={"näytöt"}
              />
            </Col>
            <Col>
              <OnOffButton
                onPackets={[{ target: 0, mode: "on", value: 1 }]}
                offPackets={[{ target: 0, mode: "on", value: 0 }]}
                text={"valkoinen"}
              />
            </Col>
            <Col>
              <OnOffButton
                onPackets={[{ target: 1, mode: "on", value: 1 }]}
                offPackets={[{ target: 1, mode: "on", value: 0 }]}
                text={"pöytä"}
              />
            </Col>
          </Row>
          <Row className="lastrow">
            <Col>
              <OnOffDimButton target={2} text={"mato"} />
            </Col>
            <Col>
              <OnOffDimButton target={3} text={"katto"} />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
