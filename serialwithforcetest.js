// note that argv[2] is part of the port that we need to after. 
// for communication details, see https://mail.google.com/mail/u/0/#inbox

var serialport = require('serialport'),
	SerialPort = serialport.SerialPort,
	portname = process.argv[2];

var myPort = new SerialPort(portname, {
	baudRate: 9600, 
	options: false, 
	parser: serialport.parsers.readline("\r\n")
});

var g = require('logitech-g27')

g.connect(function(err) {
	// turns on lED when gas pedal is depressed
	g.on('pedals-gas', function(val) {
		g.leds(val)
	}).on('wheel-turn', function(val) {
    console.log('Wheel turned to ' + val)
	}).on('shifter-gear', function(val) {
    console.log('Shifted into ' + val)
	})
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
	console.log(data);
	var force = 0.5 + data/10;
	if (data/10 < .1) {
		force = 0.5;
	}
	if (data > 0) {
		g.forceConstant(1)
	}
	else {
		g.forceConstant(0)
	}
	myPort.write('\n');
});