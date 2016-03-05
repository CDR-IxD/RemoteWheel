// defining dependencies 'serial port'
var serialport = require('serialport'),
// define SerialPort as object SerialPort in 'serialport'
	SerialPort = serialport.SerialPort,
// portname is requested as the second argument during program invocation
	portname = process.argv[2];
// initialize myPort as an instance of SerialPort 
var myPort = new SerialPort(portname, {
	baudRate: 115200, // check output baudrate as a debugging step. 
	options: false, // SerialPort options, please check serialport documentation
	parser: serialport.parsers.readline("\r\n") // automatic parcing, please check serialport documentation for more details. 
});

// defining dependencies 'logitech-g27', g is an instance of g27 wheel.
var g = require('logitech-g27')

// defining options during g.connect
var options = {
	autocenter: false,
	range: 900
}

/* Initializing global variables for target, leftlimit, and rightlimit. 
   Note that if this program is futher extended outside of protoype settings
   store these values. This is not production ready code. */
global.target = 50;
global.rightLimit = 55;
global.leftLimit = 45;


// DANGER, DANGER, TERRIBLE GLOBAL VARIABLES, ALPHA PROTOTYPE ONLY, DANGER DANGER

// currentAngle used in quasi producer-consumer model. 
global.currentAngle;

global.turning; // 0 = turning left, 1 = turning right

// tracks turning, -1 corresponds to angles past -180, 1 corresponds to angles past 180 
global.turnCounter = 0; 
// wheel status starts at 0, allowable states are -1 and 1. 
global.wheelStatus = 0; 



// CONSTANTS 
global.TOLORANCE = 0; // tolerance of angles
global.SLOW_TOLORANCE = 10; // when lower force is applied
global.PROPORTIONAL_CONSTANT = .9; // must be between 0 and 1, (functionally 0.3 and 1)
global.RANGE_CUTOFF = 10; // range cut-off filter
global.BUFFER_SIZE = 10; // size of filtering buffer
global.MEDIAN_INDEX = BUFFER_SIZE / 2;

// circular buffer 
global.buffer = new CircularBuffer(global.BUFFER_SIZE);



// initialize and connect to the g27 wheel object g. 
g.connect(options, function(err) {
	console.log('G27 Wheel is Ready');
})

// turns on lED when gas pedal is depressed
g.on('pedals-gas', function(val) {
	g.leds(val);
})

// event driven on when wheel-turn is detected
g.on('wheel-turn', function(val) {
	global.currentAngle = val;
	// console.log('Wheel turned to ' + global.currentAngle);
	// console.log('target: ' + global.target);
	var difference = (global.currentAngle - global.target);
	// console.log('difference: ' + difference);
	
	if (Math.abs(difference) < global.TOLORANCE) {
		g.forceConstant(.5);
	}
	else {
		turnWheelTo(global.target);
	}
})

// Testing function using shifting functions. 
g.on('shifter-gear', function(val) {
	console.log('Shifted into ' + val);
	if (val == 1) {
		g.forceFriction(0.65);
	}
	else if (val == 2) {
		g.forceFriction(0.5);
	}
	else if (val == 5) {
		g.forceFriction(0);
	}
	else if (val == 3) {
		// this initiates the turn, it is needed to trigger wheel-turn listener
		turnWheelTo(15);
	}
	else if (val == 0) {
		turnWheelTo(50);
	}
	else if (val == 4) {
		// this initiates the turn, it is needed to trigger wheel-turn listener
		turnWheelTo(85);
	}
	else if (val == 6) {
		angleReset();
	}
})

g.on('wheel-shift_left', function(val) {
	console.log('Wheel-shifted on left side');
})



myPort.on('open', function() {
	console.log('port is open');
	myPort.write('\n');
});

myPort.on('close', function() {
	console.log('port is closed');
});

myPort.on('error', function() {
	console.log('error, something went wrong');
});

myPort.on('data', function(data) {
	// console.log(data, global.target, global.currentAngle, (+ global.target + global.TOLORANCE));
	global.buffer.enqueue(mapValue(data));
	if (!buffer.isFull()) {
		console.log('buffering');
	}
	else {
		var a = global.buffer.array().sort();
		// console.log(Math.abs(a[global.BUFFER_SIZE - 1] - a[0]));
		// console.log(a.sort());
		if (!withinRangeCutoff(a, global.RANGE_CUTOFF)) {
			// do nothing if buffry array range exceeds limit. 
		}
		else {
			// turnWheelTo(average(a.slice(global.MEDIAN_INDEX / 3, 2 * global.MEDIAN_INDEX / 3)));
			console.log(a[global.MEDIAN_INDEX]);
			turnWheelTo(a[global.MEDIAN_INDEX]);
		}
	}
	// turnWheelTo(data);
	// if (data > global.rightLimit || data < global.leftLimit) {
	// }
});

/* turn wheel function that starts the wheel turn by comparing the currentAngle
   stored in the global variable and compares it to the target angle in order initiate
   turning if the current Angle is not within tolorance.  

   @param(angle)
 */
function turnWheelTo(angle) {
	global.target = angle;
	var difference = (global.currentAngle - global.target);
	// NOTE, js treats '+' as string concatination by default, + in front of globa.target forces int typing
	
	if (Math.abs(difference) < global.SLOW_TOLORANCE) {
		var forceCoefficient = global.PROPORTIONAL_CONSTANT * difference / (2 * global.SLOW_TOLORANCE); // max value = 0.5
		// console.log(forceCoefficient);
		if (difference > global.TOLORANCE) {
			// g.forceConstant(0.3);
			g.forceConstant(0.5 - forceCoefficient);
			global.turning = 0;
		}
		else if(difference < (-global.TOLORANCE)) {
			// g.forceConstant(0.7);
			g.forceConstant(0.5 - forceCoefficient);
			global.turning = 1;
		} else {
			g.forceConstant(.5);
		}
	}
	else if (global.currentAngle > (+ global.target + global.TOLORANCE)) {
		console.log('turned wheel left to ' + angle);
		g.forceConstant(.1);
		global.turning = 0; // turning left
	}
	else if (global.currentAngle < (+ global.target - global.TOLORANCE)) {
		console.log('turned wheel right to' + angle);
		g.forceConstant(.9);
		global.turning = 1; // turning right
	}
}

/* range filter, it takes an input of an Sortedarray and the rangeCutoff value 
   

   @param(sortedArray, ranceCutoff)
   @return bool
*/

function withinRangeCutoff(sortedArray, rangeCutoff) {
	if (Math.abs(sortedArray[sortedArray.length - 1] - sortedArray[0]) > rangeCutoff) {
		return false;
	}
	return true;
}

/* angle reset turns the wheel back to 0
*/

function angleReset() {
	turnWheelTo(50); // 50 is the middle angle of the G27 wheel. 
	global.turnCounter = 0;
}

function rotationConverter(input) {
	if(global.wheelStatus == 0 && input > 90) {
		global.wheelStatus = 1;
	}
	else if (global.wheelStatus == 0 && input < -90) {
		global.wheelStatus = -1;
	}
	else if (global.wheelStatus == 1 && input < 90 && input > 0) {
		global.wheelStatus = 0;
	}
	else if (global.wheelStatus == -1 && input > -90 && input < 0) {
		global.wheelStatus = 0;
	}
	else if (global.wheelStatus == 1 && input <= -90) {
		global.wheelStatus = -1;
		global.turnCounter += 1;
	}
	else if (global.wheelStatus == -1 && input >= 90) {
		global.wheelStatus = 1;
		global.turnCounter -= 1;
	}
	else {
		// fill out the rest
	}
	return (+ input + (global.turnCounter * 360)); 
}

/* averaging function, takes an input array and averages it over the 
   length of the array

   @param (inputArray)
   @return (arrayMean)
 */
function average(array) {
	if (Array.isArray(array)) {
		var sum = array.reduce(function(a, b) { return a + b; }, 0);
		return (sum / array.length);
	} 
}

/* map variable function, maps the input value to an output value 
   according to the desired input and output range. 

   @param (input)
   @return (mappedValue)
 */
function mapValue(input) {
	var lowIn = -180; // low limit of the input from sensor (should be -180 for symetric absolute positional sensors)
	var highIn = 180; // high limit of the input from the sensor (should be 180 for symetric absolute positional sensors)
	var lowOut = 30; // low limit of the target output value, G27 180 turn = 20, thus 50 - 30 = 20 is the default
	var highOut = 70; // high limit of the target output value for G27 50 + 20 is the default. 

	var value = rotationConverter(input);
	return (lowOut + (highOut - lowOut) * (value - lowIn) / (highIn - lowIn));
	// // this next part uses 3 variable vector to do a "time-independent" tracking of wheel turns
	// if(global.turnCounter == [0, 1, 0] && input > 60) {
	// 	global.turnCounter = [0, 1, 1];
	// } 
	// else if (global.turnCounter == [0, 1, 1] && input < -60) {
	// 	global.turnCounter = []
	// }
	// else if (global.turnCounter == [0, 1, 0] && input < -60) {
	// 	global.turnCounter = [1, 1, 0];
	// }
	
	

	// if (global.turnCounter == 0) {

	// }
	// else if (global.turnCounter > 1)
}

/* CircularBuffer class constructor that creates a circular buffer
   it is a circular array buffer built on an array.  

   @param (input)
   @return (mappedValue)
 */
function CircularBuffer(capacity) {
	this._array = new Array(capacity || 10);
	this._size = 0;
	this._first = 0;
	this._last = 0;
}

CircularBuffer.prototype.nElements = function() {
	return this._array.length;
}

CircularBuffer.prototype.isEmpty = function() {
	return this.size() == 0;
}

CircularBuffer.prototype.isFull = function() {
	return this.size() == this.nElements();
}

CircularBuffer.prototype.size = function() {
	return this._size;
}

CircularBuffer.prototype.array = function () {
	return this._array;
}

CircularBuffer.prototype.enqueue = function(input) {
	this._last = (this._first + this._size) % this.nElements();
	this._array[this._last] = input;
	if(this.isFull()) {
		this._first = (this._first + 1) % this.nElements();
	} 
	else {
		this._size++;
	}
	return this.size();
}


