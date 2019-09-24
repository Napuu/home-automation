# home-automation
Automating and controlling lights and coffeemaker, and monitoring room temperature and humidity

Consists of tree parts, of which two are included in this project
* Python web server using Flask - keeps track of all devices and makes changes to their status when needed
* Dashboard made with Vue.js + TS - Web-UI
* [homebridge](https://github.com/nfarina/homebridge) (docker configuration at [homebridge-dockerized](https://github.com/Napuu/homebridge-dockerized)) - Apple HomeKit support without Apple TV

![dashboard](dashboard.PNG?raw=true "Screenshot of dashboard. New layers and stats related to weather are WIP")