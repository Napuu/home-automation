#!/bin/bash
while :
do
  status=$(curl "http://192.168.1.122:5000/ds?target=0" -s)
  if [[ $status = *"1"* ]]; then
    echo "status on"
    echo "1000" | sudo tee /sys/class/backlight/intel_backlight/brightness
  else
    echo "status off"
    echo "0" | sudo tee /sys/class/backlight/intel_backlight/brightness
  fi
	sleep 5
done
