int LED = 7;
String comchar;

//char line[500] = "";   // 传入的串行数据
int ret = 0;

void setup() {
  Serial.begin(9600);

  // 定义7为输出引脚
  pinMode(LED, OUTPUT);

}

void loop() {
  char line[500] = "";
  if (Serial.available() > 0) {
    // 读取传入的数据:  读到 \n 为止，或者最多 500 个字符
    ret = Serial.readBytesUntil('\n', line, 500);

    //打印你得到的：
    Serial.print("I received: ");
    Serial.println(line);
  }
  // 每1秒做一个输出
  /*
  delay(1000);
  Serial.println("I am waiting! ");
  
  // 从串口缓存区读取全部数据到一个字符串型变量
  comchar = Serial.readString();  
  Serial.print("Serial.read: ");  
  Serial.println(comchar);
  */
  comchar = line;
  if (comchar == "start") {
    digitalWrite(LED, HIGH);   // 点亮LED

    //delay(1000);               // 持续1秒
  } else if (comchar == "stop") {

    digitalWrite(LED, LOW);    // 熄灭LED

    //delay(1000);               // 持续1秒
  }
 // delay(1000);

}
