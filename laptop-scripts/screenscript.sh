#!/bin/bash
okcounter=0
while :
do
  status=$(curl "http://192.168.1.122:5000/ds?target=9" -s)

  if [[ $okcounter -lt 1 ]]; then
    xset -display :0.0 dpms force off
  else
    xset -display :0.0 dpms force on
  fi

  if [[ $status = *"1"* ]]; then
    if [[ $okcounter -lt 3 ]]; then
      echo "increment"
      ((okcounter=okcounter+1))
    fi
  else
    if [[ $okcounter -gt 0 ]]; then
      echo "decrement"
      ((okcounter=okcounter-1))
    fi
  fi
	sleep 2




  #if [[ $status = *"1"* ]]; then
    #if [[ $okcounter -gt 3 ]]; then
      #echo "status on"
      #xset -display :0.0 dpms force on 
    #else
      #echo "lastok ok"
      #((lastok=lastok+1))
    #fi
  #else
    #echo "status off"
    #lastok="no"
    #xset -display :0.0 dpms force off 
  #fi
	#sleep 2
done
