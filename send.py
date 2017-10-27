#!/usr/bin/python3
#-- coding: UTF-8 --

import time
import serial
#import os

ser = serial.Serial('/dev/ttyUSB0')
exec="./exec.txt"
while True:
    file=open(exec,'r')
    tmp=file.read()
    file.close()
    if tmp:
        print(tmp)
        file=open(exec,'w')
        file.close()
        #os.system('echo -n '+ tmp +' > /dev/ttyUSB0')
        #ser.write(b'start')
        ser.write(tmp.encode("ascii"))
        #GPIO.output(led_pin,True)
        #time.sleep(3)
        #GPIO.output(led_pin,False)
time.sleep(1)

