/*
 * SuperDock
 *
 * Version: v0.11
 * Date: 2017.11.2
 *
 */

String comchar;

struct Action {
  String  cmd;
  int  button;
  boolean button_status;
  boolean cw_status;
  int  en;
  int  cw;
  int  clk;
  int  speed;
};

/*
*命令，限位开关接口，限位开关状态， cw方向， en, cw, clk
*/

struct Action action_lib[] = {
  {"plet_up", A0, HIGH, HIGH, 10, 9, 8, 1000},
  {"plet_down", A0, HIGH, LOW, 10, 9, 8, 100},
  {"plet_do", A0, HIGH, LOW, 10, 9, 8, 100},
  {"stopplet_down", A2, HIGH, HIGH, 13, 12, 11, 500}
};

//char line[500] = "";   // 传入的串行数据
int ret = 0;

int init(struct Action *action) {

  pinMode(action->button, INPUT_PULLUP);

  pinMode(action->en, OUTPUT);
  pinMode(action->cw, OUTPUT);
  pinMode(action->clk, OUTPUT);
  return 0;
}

void setup() {
  Serial.begin(9600);

  for( int a = 0; a < sizeof(action_lib)/sizeof(action_lib[0]); a++ ) {
    init(&action_lib[a]);
  }
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
  digitalWrite(action->cw, action->cw_status);               // motor dir : Open the door
  while(digitalRead(action->button) == action->button_status) {      // loop until the button is pressed
    digitalWrite(action->clk, HIGH);
    delayMicroseconds(action->speed);                    // motor speed
    digitalWrite(action->clk, LOW);
    delayMicroseconds(action->speed);                    // motor speed
  }
  digitalWrite(action->en, HIGH);                // disable the motor
  return 0;
}
/////////////////////////////////

void loop() {

  comchar = msg();
  //for( int a = 0; a < ACTION_MAX_SIZE; a++ ) {
  for( int a = 0; a < sizeof(action_lib)/sizeof(action_lib[0]); a++ ) {
    //Serial.println(a);
    if (comchar == action_lib[a].cmd) {
      action(&action_lib[a]);
    }
  }

}
