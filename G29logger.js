var g = require('logitech-g29');

var options = {
	autocenter: false,
	debug: false,
	range: 900
}

global.currentWheelAngleCourse = 0;
global.currentWheelangleFine = 0;
global.currentBraking = 0;
global.currentAccel = 0;
global.currentClutch = 0;
global.shifter = 0;
global.leftshift = 0;
global.rightshift = 0;

initialLog();

g.connect(options, function(err) {
	var interval = setInterval(streamingLog, 1);
})

g.on('data', function(val) {
    // console.log(val) // this buffer is fun to look at for awhile if you want to uncomment it

    data = val // set the global var to local event data for easy poking like data[x] where x is 0 thru 10 for the buffer position
    wheel_course = val[5]
    wheel_fine = val[4]

    if (wheel_fine & 1) {
        // someone is pressing the left middle red button so decrement position by 1
        wheel_fine -= 1
    }

    if (wheel_fine & 2) {
        // someone is pressing the left bottom red button so decrement position by 2
        wheel_fine -= 2
    }

    // console.log('wheel turn ' + wheel_course + ' ' + wheel_fine)
    global.currentWheelAngleCourse = wheel_course
    global.currentWheelangleFine = wheel_fine

    global.currentAccel = Math.abs(data[6]-255)
    global.currentBraking = Math.abs(data[7]-255)
    global.currentClutch = Math.abs(data[8]-255)

})

// g.on('pedals-gas', function(val) {
// 	g.leds(val);
// 	global.currentAccel = val;
// })

// g.on('pedals-brake', function(val) {
// 	global.currentBraking = val;
// })

// g.on('pedals-clutch', function(val) {
// 	global.currentClutch = val;
// })

// g.on('wheel-turn', function(val) {
// 	global.currentWheelAngle = val;
// })

g.on('wheel-shift_left', function(val) {
	global.leftshift = val;
})

g.on('shifter-gear', function(val) {
	global.shifter = val;
})

g.on('wheel-shift_right', function(val) {
	global.rightshift = val;
})

function initialLog() {
	console.log("Timestamp, ", "CurrentWheelAngleCourse, ", "CurrentWheelAngleFine, ", "CurrentBraking, ", "CurrentAccel, ", "CurrentClutch, ", "StickShifter, ", "Leftshift, ", "Rightshift\n");
}

function streamingLog() {
	console.log(Date.now() + ", " + global.currentWheelAngleCourse + ", " + global.currentWheelangleFine+ ", " + global.currentBraking + ", " + global.currentAccel + ", " +
		global.currentClutch + ", " + global.shifter + ", " + global.leftshift + ", " + global.rightshift + "\n");
}

