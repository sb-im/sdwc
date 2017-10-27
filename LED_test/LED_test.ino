#define BUTTON_START A0
#define BUTTON_DOOR_OPENED A1
#define BUTTON_PLAT_TOP A2
#define BUTTON_LANDED A3
#define BUTTON_FIXED A4
                                                        // define motor
#define MOTOR_DOOR_EN 13
#define MOTOR_DOOR_DIR 12
#define MOTOR_DOOR_CLK 11

#define MOTOR_PLAT_EN 10
#define MOTOR_PLAT_DIR 9
#define MOTOR_PLAT_CLK 8

#define MOTOR_FIX_EN 7
#define MOTOR_FIX_DIR 6
#define MOTOR_FIX_CLK 5



int LED = 7;
String comchar;



struct Action {
  int  button;
  boolean button_status;
  int  en;
  int  cw;
  int  clk;
} action1, action2;


struct Action action3 = {BUTTON_START, 1, 13, 12, 11};
/*
action1.button = BUTTON_START
action1.button_status = HIGH
action1.en = MOTOR_DOOR_EN
action1.cw = MOTOR_PLAT_DIR
action1.clk = MOTOR_DOOR_CLK
*/

//char line[500] = "";   // 传入的串行数据
int ret = 0;

void setup() {
  Serial.begin(9600);

  // 定义7为输出引脚
  pinMode(LED, OUTPUT);


  pinMode(BUTTON_START, INPUT_PULLUP);
  pinMode(BUTTON_DOOR_OPENED, INPUT_PULLUP);
  pinMode(BUTTON_PLAT_TOP, INPUT_PULLUP);
  pinMode(BUTTON_LANDED, INPUT_PULLUP);
  pinMode(BUTTON_FIXED, INPUT_PULLUP);

  // define motor output
  pinMode(MOTOR_DOOR_EN, OUTPUT);
  pinMode(MOTOR_DOOR_DIR, OUTPUT);
  pinMode(MOTOR_DOOR_CLK, OUTPUT);

  pinMode(MOTOR_PLAT_EN, OUTPUT);
  pinMode(MOTOR_PLAT_DIR, OUTPUT);
  pinMode(MOTOR_PLAT_CLK, OUTPUT);

  pinMode(MOTOR_FIX_EN, OUTPUT);
  pinMode(MOTOR_FIX_DIR, OUTPUT);
  pinMode(MOTOR_FIX_CLK, OUTPUT);

}

/////////////////////////////////
String msg() {
  char line[500] = "";
  if (Serial.available() > 0) {
    // 读取传入的数据:  读到 \n 为止，或者最多 500 个字符
    ret = Serial.readBytesUntil('\n', line, 500);

    //打印你得到的：
    Serial.print("I received: ");
    Serial.println(line);
  }
  return line;
}


int action(struct Action *action) {

  digitalWrite(action->en, LOW);                // enable the motor
  digitalWrite(action->cw, HIGH);               // motor dir : Open the door
  while(digitalRead(action->button) == HIGH) {      // loop until the button is pressed
    digitalWrite(action->clk, HIGH);
    delayMicroseconds(500);                    // motor speed
    digitalWrite(action->clk, LOW);
    delayMicroseconds(500);                    // motor speed
  }
  digitalWrite(action->en, HIGH);                // disable the motor
  return 0;
}
/////////////////////////////////

void loop() {

  comchar = msg();
  if (comchar == "start") {
    digitalWrite(LED, HIGH);   // 点亮LED
    Serial.println(action3.button);
    Serial.println(action3.button_status);
    action( &action3 );

    //delay(1000);               // 持续1秒
  } else if (comchar == "stop") {

    digitalWrite(LED, LOW);    // 熄灭LED

    //delay(1000);               // 持续1秒
  }
 // delay(1000);

}
