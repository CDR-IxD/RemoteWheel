/* Wheel rotation readout through IMU
 * Written by Peter Wang @ Stanford University Center for Design Research
 * MIT License
 */

// importing libraries
// note all libraries are dependencies of Simple_AHRS. 
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>
#include <Adafruit_BMP085_U.h>
#include <Adafruit_Simple_AHRS.h>

// Create sensor instances.
Adafruit_LSM303_Accel_Unified accel(30301);
Adafruit_LSM303_Mag_Unified   mag(30302);
Adafruit_BMP085_Unified       bmp(18001);

// Create simple AHRS algorithm using the above sensors.
Adafruit_Simple_AHRS          ahrs(&accel, &mag);

// Constants
// if using mapped value, use the following constants
//const int LEFT_ROLL_LIMIT = -180;
//const int RIGHT_ROLL_LIMIT = 180;
//const int LEFT_OUT_LIMIT = 30;
//const int RIGHT_OUT_LIMIT = 70;

// initialize global variable.
sensors_vec_t orientation; 
// int mappedValue;

void setup() {
  Serial.begin(115200);
  // Initialize the sensors.
  accel.begin();
  mag.begin();
  bmp.begin();
  Serial.println(F("IMU sensor initialized")); Serial.println("");
}

void loop(void) {
  // note, only the orientation angle is used to calculate wheel turns. 
  // mappedValue = map(orientation.roll, LEFT_ROLL_LIMIT, RIGHT_ROLL_LIMIT, LEFT_OUT_LIMIT, RIGHT_OUT_LIMIT);
  if (ahrs.getOrientation(&orientation))
  {
    Serial.println(orientation.roll);
    // Serial.println(mappedValue);
  }
}
