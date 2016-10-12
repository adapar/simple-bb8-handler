var sphero = require("sphero");
var bb8 = sphero("97c017887e5b402fa7d4ed6231b0547e"); // change BLE address accordingly

var keypress = require('keypress')

var speed = 0;
var angle = 0;

var speedDelta = 10;
var angleDelta = 10;

var in_calibration = false;

var last_color = { red: 0, green: 0, blue: 0 };

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
  //bb8.stop();
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

function checkCollision() {
  console.log("::COLLISION::");  
  console.log("::collision data", data)
}

function start() {
  console.log("::START::");

  keypress(process.stdin);
  
  process.stdin.on('keypress', processKey);
   
  process.stdin.setRawMode(true);
  process.stdin.resume();

  bb8.detectCollisions();
  bb8.streamImuAngles();

  bb8.on("collision", checkCollision);

  bb8.on("imuAngles", function(data) {
    console.log("data:");
    console.log("  pitchAngle:", data.pitchAngle);
    console.log("  rollAngle:", data.rollAngle);
    console.log("  yawAngle:", data.yawAngle);
  });
}

function processKey(ch, key) {
  console.log('got "keypress"', key);

  if (key) {
    if (in_calibration) {
      if (key.name == 'c') {
        calibrate_end();
      }
    } else {
      if (key.ctrl === false) {
        if (key.name == 's') {
          stop();
        } else if (key.name == 'c') {
          calibrate_start();
        } else if (key.name == 'up') {
          accelerate();
        } else if (key.name == 'down') {
          decelerate();
        } else if (key.name == 'left') {
          left();
        } else if (key.name == 'right') {
          right();
        } else if (key.name == 'x') {
          finish();
        }
      } else {
        if (key.name == 'r') {
          bb8.color("#ff0000");
        } else if (key.name == 'g') {
          bb8.color("#00ff00");
        } else if (key.name == 'b') {
          bb8.color("#0000ff");
        } else if (key.name == 'n') {
          bb8.color("#000000");
        } else if (key.name == 'up') {
          if (!in_calibration) setAngle(0);
        } else if (key.name == 'down') {
          if (!in_calibration) setAngle(180);
        } else if (key.name == 'left') {
          if (!in_calibration) setAngle(270);
        } else if (key.name == 'right') {
          if (!in_calibration) setAngle(90);
        } 
      }
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
