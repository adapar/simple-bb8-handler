var sphero = require("sphero");
var bb8 = sphero("97c017887e5b402fa7d4ed6231b0547e"); // change BLE address accordingly

var keypress = require('keypress')

var speed = 0;
var angle = 0;

var speedDelta = 10;
var angleDelta = 10;

var in_calibration = false;

function calibrate_start() {
  console.log("::START CALIBRATION::");
  bb8.startCalibration();
  in_calibration = true;
}

function calibrate_end() {
  console.log("::FINISH CALIBRATION::");
  bb8.finishCalibration();
  in_calibration = false;
}

function accelerate() {
  speed = speed + speedDelta;
  updateRoll();
}

function decelerate() {
  speed = speed - speedDelta;
  if (speed < 0) {
    speed = 0;
  }
  updateRoll();
}

function stop() {
  speed = 0;
  updateRoll();
}

function setAngle(newAngle) {
  angle = newAngle;
  updateRoll();
}

function left() {
  angle = angle - angleDelta;
  if (angle < 0) {
    angle = angle + 360;
  }
  updateRoll();
}

function right() {
  angle = angle + angleDelta;
  if (angle > 359) {
    angle = angle - 360;
  }
  updateRoll();
}

function start() {
  console.log("::START::");

  keypress(process.stdin);
  
  process.stdin.on('keypress', processKey);
   
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function processKey(ch, key) {
  console.log('got "keypress"', key);

  if (key) {
    if (key.name == 's') {
      bb8.stop();
    } else if (key.name == 'c') {
      if (in_calibration) {
        calibrate_end();
      } else {
        calibrate_start();
      }
    } else if (key.name == 'up') {
      if (!in_calibration) setAngle(0);
    } else if (key.name == 'down') {
      if (!in_calibration) setAngle(180);
    } else if (key.name == 'left') {
      if (!in_calibration) setAngle(90);
    } else if (key.name == 'right') {
      if (!in_calibration) setAngle(270);
    } else if (key.name == 'a') {
      if (!in_calibration) accelerate();
    } else if (key.name == 'z') {
      if (!in_calibration) decelerate();
    } else if (key.name == 'x') {
      finish();
    }
  }
}

function finish() {
  console.log("::FINISH::");
  
  process.stdin.pause();
  
  if (in_calibration) {
    calibrate_end();
  }

  bb8.stop();
  bb8.sleep();

  process.exit();
}

function updateRoll() {
  console.log("::UPDATE ROLL::");
  console.log("::NEW SPEED = " + speed);
  console.log("::NEW ANGLE = " + angle);
  if (speed < 1) {
    bb8.stop();
  } else {
    bb8.roll(speed, angle);
  }
}

bb8.connect(function() {
  console.log("::CONNECTED::");

  start();
});
