int LED = 7;
String comchar;

void setup() {
  Serial.begin(9600);

  // 定义7为输出引脚
  pinMode(LED, OUTPUT);

}

void loop() {
  // 从串口缓存区读取全部数据到一个字符串型变量
  comchar = Serial.readString();  
  Serial.print("Serial.read: ");  
  Serial.println(comchar);
  if (comchar == "start") {
    digitalWrite(LED, HIGH);   // 点亮LED

    delay(1000);               // 持续1秒
  } else if (comchar == "stop") {

    digitalWrite(LED, LOW);    // 熄灭LED

    delay(1000);               // 持续1秒
  }
  delay(1000);
}
