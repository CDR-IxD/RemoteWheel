# Marionette Wheel System
### Under Construction, Work in Progress

## Setting up the Logitech G27 wheel through Node.

1. Install the latest Node.js package from h ttps://nodejs.org/en/ (Note that this device setup has been tested on 4.3.1)
2. Run a js test file (console.log(‘Hello World’) to verify node is properly installed
3. use npm (node Package Manager) to install
https://www.npmjs.com/package/logitech-g27 
Please note that node packages HAS TO BE INSTALLED IN THE PROJECT DIRECTORY!! see details in https://docs.npmjs.com/files/folders
4. Run the test LED file to see if the communication between computer and the G27 Wheel is properly functioning.
Checkpoint: node can now successfully read and write to the G27 wheel.
5. use npm to install serial communication: npm install serialport
6. use an arduino and load serialwithforcetest.ino onto it.
7. try running serialwithforcetest.js through node
8. Great success!


## Setting up the Light controllers.

1. Use npm to install johnny-five and node-pixel
2. Connect the LED setup as described in the paper

## Testing the system.

1. Use Listports.js to find out which ports correspond to the IMU sensor and the LED output. 
2. Run "g27pitchcontrolledv4.js" with the corresponding ports (IMU sensor port, LED output arduino)
