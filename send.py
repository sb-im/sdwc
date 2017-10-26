#!/usr/bin/python3
#-- coding: UTF-8 --

import time
import os
'''

ser = serial.Serial('/dev/ttyUSB0')

#ser.open()

print(ser.is_open)
# open serial port
print(ser.name)
# check which port was really used

ser.write(b'start')
# write a string

ser.close()
# close port
'''
'''
import binascii

s=serial.Serial('/dev/ttyUSB0',9600)
#s.open()
#接收
n=s.in_waiting()
if n:
    data= str(binascii.b2a_hex(s.read(n)))[2:-1]
    print(data)
#发送
#d=bytes.fromhex('10 11 12 34 3f')

#cmd = "start"
cmd = 'start'
#print(type(d))
#s.write(bytes.fromhex(cmd))
#print(type(cmd.encode("ascii")))
s.write('start')
s.close()
'''

'''
ser = serial.Serial("/dev/ttyUSB0",9600,)  #Serial类实例化一个对象
line = ser.readline()
while line:
    #print(time.strftime("%Y-%m-%d %X\t") + line.strip())
    line = ser.readline()

    # 每 10 秒向窗口写当前计算机时间
    sep  = int(time.strftime("%S")) % 10
    if sep == 0:
        ser.write("hello, I am hick, the time is : " + time.strftime("%Y-%m-%d %X\n"))      # write a string

ser.close()

'''

exec="./exec.txt"
while 1:
    file=open(exec,'r')
    tmp=file.read()
    file.close()
    if tmp:
        print(tmp)
        file=open(exec,'w')
        file.close()
        os.system('echo -n '+ tmp +' > /dev/ttyUSB0')
        #GPIO.output(led_pin,True)
        #time.sleep(3)
        #GPIO.output(led_pin,False)
time.sleep(1)

