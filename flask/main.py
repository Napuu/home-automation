import sys
import RPi.GPIO as g
import requests
import json
from flask import Flask, request
import datetime
import threading

#local imports
from ping import isLaptopUp 
import externalDevices

# hue username 2l92tBQMmLQ418BvFnl6P6Vw3DisqnFVDwrjYnSp

# indexes
# 0 - relay switch on rpi controlled through gpio-pins
# 1 - relay switch on rpi controlled through gpio-pins
# 2 - philips hue light bulb - under table right now (hue-bridge id 2)
# 3 - philips hue light bulbs - ceiling lamp (hue-bridge ids 1,3,4)
# 6 - coffeemaker
# 7 - nexaswitch1


# this flask-server is only way to control relay switches so their status is always up-to-date

# hue lights can be controlled also through apple homekit so their status is fetched every n seconds 
# straight from hue-bridge


# hue lightbulbs color temperature range - 153-454
# hue lightbulbs brightness range - 0-254
status = {
    0: {
        "on": 0
    }, 
    1: {
        "on": 0
    }, 
    2: {
        "on": 0,
        "bri": 100,
        "ct": 153
    }, 
    3: {
        "on": 0,
        "bri": 100,
        "ct": 153
    }, 
    6: {
        "on": 0,
        "time": "00:00",
        "timer_on": 0
    },
    7: {
        "on": 0
    }
}

# status of hue-lights is fetched directly from hue-bridge every 2 seconds
def getHueStatus():
    threading.Timer(2.0, getHueStatus).start()
    r = requests.get("http://192.168.1.219/api/2l92tBQMmLQ418BvFnl6P6Vw3DisqnFVDwrjYnSp/lights")
    rj = r.json()
    for i in range(2, 4):
        status[i]["on"] = int(rj[str(i)]["state"]["on"])
        status[i]["bri"] = int(rj[str(i)]["state"]["bri"])
        status[i]["ct"] = int(rj[str(i)]["state"]["ct"])
getHueStatus()

# transmitter is used to control nexa-switches and coffeemaker
transmitter = externalDevices.Transmitter()
transmitter.initialize()

#  DEVICE SPECIFIC HANDLERS START
def switch1(specs): 
    on = int(specs["on"])
    g.output(20, on)
    g.output(21, on)

def switch2(specs):
    on = int(specs["on"]) 
    g.output(5, on)
    g.output(6, on)

def hue1(specs):
    hue(2, specs)

def hue2(specs):
    hue(1, specs)
    hue(3, specs)
    hue(4, specs)

def hue(hueID, specs):
    data = {}
    if (specs.get("on") is not None): data["on"] = bool(int(specs["on"]))
    if (specs.get("bri") is not None): data["bri"] = int(specs["bri"])
    if (specs.get("ct") is not None): data["ct"] = int(specs["ct"])
    r = requests.put("http://192.168.1.219/api/2l92tBQMmLQ418BvFnl6P6Vw3DisqnFVDwrjYnSp/lights/" + str(hueID) + "/state",
            json.dumps(data))

def nexaSwitch1(specs):
    transmitter.nexa1(specs["on"])

def coffee(specs):
    timer = None
    if (status[6]["on"]):
        transmitter.coffee(1)
        #  auto-off after 40 minutes
        def off():
            status[6]["on"] = 0
        timer = threading.Timer(2400.0, off)
        timer.start()
    else:
        transmitter.coffee(0)
        if (timer != None): 
            timer.cancel()
#  DEVICE SPECIFIC HANDLERS END

#  check every 15 seconds if current minutes and hours match with ones in status
#  if so, also check timer_on paremeter and set coffee on
def coffeeTimer():
    now = datetime.datetime.now()
    timething = status[6]["time"].split(":")
    hours = int(timething[0])
    minutes = int(timething[1])
    if (int(now.hour) == hours and int(now.minute) == minutes and status[6]["timer_on"] == 1):
        transmitter.coffee(1)
        status[6]["on"] = 1
        def off():
            transmitter.coffee(0)
            status[6]["on"] = 0
        timer = threading.Timer(2400.0, off)
        timer.start()

    checkTimer = threading.Timer(15, coffeeTimer)
    checkTimer.start()
coffeeTimer()

#  check if my main computer is up
#  if its up, turn screens and speakers on
def isUpTimer():
    isUp = isLaptopUp()
    if (isUp):
        transmitter.screens(1)
    else:
        transmitter.screens(0)
    uTimer = threading.Timer(5, isUpTimer)
    uTimer.start()
isUpTimer()

# "enum" for eventhandlers
switches = {
    0: switch1,
    1: switch2,
    2: hue1,
    3: hue2,
    6: coffee,
    7: nexaSwitch1
}

g.setwarnings(False)
def initPins():
    g.setmode(g.BCM)
    g.setup(5, g.OUT)
    g.setup(6, g.OUT)
    g.setup(20, g.OUT)
    g.setup(21, g.OUT)
initPins()

app = Flask(__name__)

@app.route("/ds")
def ds():
    # ds called without arguments => return status of everything
    if (len(request.args) == 0): return json.dumps(status)

    # ds is called with only one argument, target => return status of that device
    if (len(request.args) == 1): return json.dumps(status[int(request.args["target"])])

    # update status 
    for key in request.args:
        if (key == "target"): continue
        # special case for coffeemakers timers time because its the only status value stored as a string
        if (key == "time"):
            status[int(request.args["target"])][key] = request.args[key]
            continue
        status[int(request.args["target"])][key] = int(request.args[key])

    # call corresponding handler with requests arguments to handle the event
    switches[int(request.args["target"])](request.args)
    return "done"

