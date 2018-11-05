import serial
import time

class Transmitter:
    def __init__(self):
        self.nexaSerial = None
        self.coffeeSerial = None
    def initialize(self):
        self.nexaSerial = serial.Serial("/dev/ttyUSB0")
        self.coffeeSerial = serial.Serial("/dev/ttyUSB1")
    
    def screens(self, status):
        self.nexaSerial.write(("39849433 0 " + str(status) + " 0").encode())

    def coffee(self, status):
        self.nexaSerial.write(("2051610 0 " + str(status) + " 0").encode())
        time.sleep(2)
        coffeeMessage = "coffeeOn"
        if (status == 0):
            coffeeMessage = "coffeeOff"
        for i in range(5):
            self.coffeeSerial.write(coffeeMessage.encode())
    
    def nexa1(self, status):
        self.nexaSerial.write(("39849443 0 " + str(status) + " 0").encode())

    def close(self):
        self.nexaSerial.close()
        self.coffeeSerial.close()
