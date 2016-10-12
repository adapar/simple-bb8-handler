var sphero = require("sphero");
var bb8 = sphero("97c017887e5b402fa7d4ed6231b0547e"); // change BLE address accordingly

var keypress = require('keypress')

var speed = 0;
var angle = 0;

var speedDelta = 10;
var angleDelta = 10;

var inCalibration = false;

var lastColor = { red:0, green:0, blue:0 };

var colorTransitionDelay = 1000;

var colorBlack = { red:0, green:0, blue:0 };
var colorWhite = { red:255, green:255, blue:255 };
var colorRed = { red:219, green:10, blue:22 };
var colorOrange = { red:252, green:99, blue:59 };
var colorYellow = { red:254, green:245, blue:54 };
var colorGreen = { red:27, green:186, blue:31 };
var colorBlue = { red:27, green:158, blue:252 };
var colorPurple = { red:49, green:18, blue:153 };

var colorSmoothTransitionActive = false;

function calibrateStart() {
  console.log("::START CALIBRATION::");
  bb8.startCalibration();
  inCalibration = true;
}

function calibrateEnd() {
  console.log("::FINISH CALIBRATION::");
  bb8.finishCalibration();
  inCalibration = false;
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
  angle = 0;
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

function guardColor(value) {
  value = Math.ceil(value);
  if (value > 255) {
    return 255;
  }
  if (value < 0) {
    return 0;
  }
  return value;
}
function getColorFromGradient(color1, color2, percent) {
  return {
    red: guardColor(color1.red + percent * (color2.red - color1.red))
    , green: guardColor(color1.green + percent * (color2.green - color1.green))
    , blue: guardColor(color1.blue + percent * (color2.blue - color1.blue))
  };
}

function setColor(color2) {
  console.log("::SET COLOR::");
  console.log(" color2: ", color2)
  if (colorSmoothTransitionActive) {
    var color1 = lastColor;
    console.log(" YES DELAY::");
    console.log(" color1: ", color1);
    console.log(" colorTransitionDelay: ", colorTransitionDelay)
    var percent = 0;
    var percentDelta = 1 / colorTransitionDelay;
    console.log(" percentDelta: ", percentDelta);
    var timer = setInterval(function () {
      console.log(" ::TIMER>");
      console.log(" percent: ", percent);
      percent = percent + percentDelta;
      if (percent > 1) {
        console.log("   done!");
        bb8.color(color2);
        lastColor = color2;
        clearInterval(timer);
      } else {
        var colorX = getColorFromGradient(color1, color2, percent);
        console.log("   new intermediate color:", colorX);
        bb8.color(colorX);
      }
    }, 1);
  } else {
    console.log(" NO DELAY::");
    bb8.color(color2);
  }
}

function checkCollision() {
  console.log("::COLLISION::");  
  console.log("::collision data", data)
}

function start() {
  console.log("::START::");

  setColor(lastColor);

  keypress(process.stdin);
  
  process.stdin.on('keypress', processKey);
   
  process.stdin.setRawMode(true);
  process.stdin.resume();

  bb8.detectCollisions();

  bb8.on("collision", checkCollision);
}

function processKey(ch, key) {
  console.log('got "keypress"', key);

  if (key) {
    if (inCalibration) {
      if (key.name == 'c') {
        calibrateEnd();
      }
    } else {
      if (key.ctrl === false) {
        if (key.shift === false) {
          if (key.name == 's') {
            stop();
          } else if (key.name == 'c') {
            calibrateStart();
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
          if (key.name == 't') {
            colorSmoothTransitionActive = !colorSmoothTransitionActive;
          }
        }
      } else {
        if (key.name == 'r') {
          setColor(colorRed);
        } else if (key.name == 'o') {
          setColor(colorOrange);
        } else if (key.name == 'y') {
          setColor(colorYellow);
        } else if (key.name == 'g') {
          setColor(colorGreen);
        } else if (key.name == 'b') {
          setColor(colorBlue);
        } else if (key.name == 'p') {
          setColor(colorPurple);
        } else if (key.name == 'n') {
          setColor(colorBlack);
        } else if (key.name == 'w') {
          setColor(colorWhite);
        } else if (key.name == 'up') {
          if (!inCalibration) setAngle(0);
        } else if (key.name == 'down') {
          if (!inCalibration) setAngle(180);
        } else if (key.name == 'left') {
          if (!inCalibration) setAngle(270);
        } else if (key.name == 'right') {
          if (!inCalibration) setAngle(90);
        } 
      }
    }
  }
}

function finish() {
  console.log("::FINISH::");
  
  process.stdin.pause();
  
  if (inCalibration) {
    calibrateEnd();
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
