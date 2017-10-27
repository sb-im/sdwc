/*
 * SuperDock
 *
 * Version: v0.01
 *
 */
                                                        // define button
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


//#define BEACON_POWER

void setup() {
   Serial.begin(115200);
                                                        // define button input
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

/*
void action(button, en, dir, clk) {
  digitalWrite(dir, HIGH);               // motor dir : Open the door
  while(digitalRead(button) == HIGH) {      // loop until the button is pressed
    digitalWrite(clk, HIGH);
    delayMicroseconds(500);                    // motor speed
    digitalWrite(clk, LOW);
    delayMicroseconds(500);                    // motor speed
  }
  digitalWrite(en, HIGH);                // disable the motor
}
*/
void loop() {

                                                         // OPEN THE DOOR

    if (digitalRead(BUTTON_START) == LOW){               // when click the button
        Serial.println("Start the DEMO");
        Serial.println("Open the door");
        digitalWrite(MOTOR_DOOR_DIR,HIGH);               // motor dir : Open the door
        while(digitalRead(BUTTON_DOOR_OPENED)==HIGH){      // loop until the button is pressed
              digitalWrite(MOTOR_DOOR_CLK,HIGH);
              delayMicroseconds(500);                    // motor speed
              digitalWrite(MOTOR_DOOR_CLK,LOW);
              delayMicroseconds(500);                    // motor speed
              }
        Serial.println("The door is open");
        digitalWrite(MOTOR_DOOR_EN,HIGH);                // disable the motor
    }
                                                         // RISE THE PLATFORM
        Serial.println("Rise the platform");
        digitalWrite(MOTOR_PLAT_DIR,HIGH);               // motor dir : rise the platform
        while(digitalRead(BUTTON_PLAT_TOP)==HIGH){       // loop until the button is pressed
              digitalWrite(MOTOR_PLAT_CLK,HIGH);
              delayMicroseconds(500);                    // motor speed
              digitalWrite(MOTOR_PLAT_CLK,LOW);
              delayMicroseconds(500);                    // motor speed
              }
        Serial.println("The platform reaches the top");
        digitalWrite(MOTOR_PLAT_EN,HIGH);                // disable the motor

                                                         // CHECK THE DRONE

        if (digitalRead(BUTTON_LANDED)== LOW){
              delay(10000);
              if (digitalRead(BUTTON_LANDED)== LOW){
                      Serial.println("The Drone has landed");
                      Serial.println("Fix the drone");          // FIX THE DRONE
                      digitalWrite(MOTOR_FIX_DIR,HIGH);               // motor dir : Open the door
                      while(digitalRead(BUTTON_FIXED)==HIGH){      // loop until the button is pressed
                            digitalWrite(MOTOR_FIX_CLK,HIGH);
                            delayMicroseconds(500);                    // motor speed
                            digitalWrite(MOTOR_FIX_CLK,LOW);
                            delayMicroseconds(500);                    // motor speed
                            }
              Serial.println("The drone is fixed");
              digitalWrite(MOTOR_FIX_EN,HIGH);                // disable the motor
              }
        }





}



