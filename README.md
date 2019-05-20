# home-automation
Automating and controlling lights and coffeemaker, and monitoring room temperature and humidity

Consists of four parts, of which three are included in this project
* Python web server using Flask - keeps track of all devices and changing their status
* React - Web-UI
* Node.js, socket.io backend - communication between Flask and React (this one could be implemented as traditional REST Api, but I wanted to test socket.io)
* [homebridge](https://github.com/nfarina/homebridge) - Apple HomeKit support without Apple TV

![reactui](screenshot_react-interface.png?raw=true "Screenshot of web interface")

Each startup script should be ran as 
```
pm2 start start*** --interpreter=bash
```
