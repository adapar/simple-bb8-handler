var sphero = require("sphero");
var bb8 = sphero("97c017887e5b402fa7d4ed6231b0547e"); // change BLE address accordingly

var keypress = require('keypress')

var speed = 0;
var angle = 0;

var speedDelta = 10;
var angleDelta = 10;

function calibrate_start() {
  console.log("::START CALIBRATION::");
  bb8.startCalibration();
}

function calibrate_end() {
  console.log("::FINISH CALIBRATION::");
  bb8.finishCalibration();
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
  keypress(process.stdin);
  
  process.stdin.on('keypress', processKey);
   
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

function processKey(ch, key) {
    console.log('got "keypress"', key);

//   //   if (key) {
//   //     if (key.name == 's') {
//   //       bb8.stop();
//   //     } else if (key == 'up') {
//   //       bb8.roll(100, 0);
//   //     } else if (key == 'down') {
//   //       bb8.roll(100, 180);
//   //     } else if (key == 'left') {
//   //       bb8.roll(100, 90);
//   //     } else if (key == 'right') {
//   //       bb8.roll(100, 270);
//   //     } else if (key == 'k') {
//   //       console.log('Done!');
//   //       process.stdin.pause();
//   //       bb8.stop();
//   //     }
//   //   }

    if (key && key.ctrl && key.name == 'c') {
      finish();
    }
}

function finish() {
  process.stdin.pause();
  bb8.stop();
  bb8.sleep();
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
