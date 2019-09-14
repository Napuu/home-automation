import sys
import RPi.GPIO as g
import requests
import json
from flask import Flask, request
import datetime
import threading
import subprocess

#local imports
from ping import isLaptopUp 

# hue username 2l92tBQMmLQ418BvFnl6P6Vw3DisqnFVDwrjYnSp

# indexes
# 0 - relay switch on rpi controlled through gpio-pins - the white bright light
# 1 - relay switch on rpi controlled through gpio-pins - table lamp
# 2 - philips hue light bulb - under table right now (hue-bridge id 2)
# 3 - philips hue light bulbs - ceiling lamp (hue-bridge ids 1,3,4)
# 9 - relay switch on rpi controlled through gpio-pins - screens and stuff
# 10 - relay switch on rpi controlled through gpio-pins - not connected anywhere right now

# this flask-server is only way to control relay switches so their status is always up-to-date

# hue lights can be controlled also through apple homekit so their status is fetched every n seconds 
# straight from hue-bridge

# init pins
g.setwarnings(False)
def initPins():
    g.setmode(g.BCM)
    g.setup(5, g.OUT)
    g.setup(6, g.OUT)
    g.setup(20, g.OUT)
    g.setup(21, g.OUT)
    g.setup(26, g.OUT)
    g.setup(19, g.OUT)
    g.setup(17, g.OUT)
    g.setup(27, g.OUT)
initPins()

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
    9: {
        "on": 0
    },
    10: {
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

#  DEVICE SPECIFIC HANDLERS START
def switch1(specs): 
    on = int(specs["on"])
    g.output(20, on)
    g.output(21, on)

def switch2(specs):
    on = int(specs["on"]) 
    g.output(5, on)
    g.output(6, on)

def switch3(specs):
    on = int(specs["on"]) 
    g.output(19, on)
    g.output(26, on)

def switch4(specs):
    on = int(specs["on"]) 
    g.output(17, on)
    g.output(27, on)

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
# DEVICE SPECIFIC HANDLERS END

# check if my main computer is up
# if its up, turn screens and speakers on
# keep track of state and only broadcast control signal if state has changed
previousState = None
def isUpTimer():
    isUp = isLaptopUp()
    global previousState
    if (isUp and isUp != previousState):
        switch3({"on": 1})
    elif (not isUp and isUp != previousState):
        switch3({"on": 0})
    previousState = isUp
    uTimer = threading.Timer(5, isUpTimer)
    uTimer.start()
isUpTimer()

# "enum" for eventhandlers
switches = {
    0: switch1,
    1: switch2,
    2: hue1,
    3: hue2,
    9: switch3,
    10: switch4
}


app = Flask(__name__)

@app.route("/room_conditions")
def room_conditions():
    s = subprocess.check_output(["dht22"]).decode().split(" ")
    return "{\"temperature\":" + s[1] + ",\"humidity\":"+ s[3] + "}"

@app.route("/humidity")
def humidity():
    return subprocess.check_output(["dht22"]).decode().split(" ")[3]

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
        print(request.args["target"])
        print(key)
        print(request.args[key])
        status[int(request.args["target"])][key] = int(request.args[key])

    # call corresponding handler with requests arguments to handle the event
    switches[int(request.args["target"])](request.args)
    return "done"

