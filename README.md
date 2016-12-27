# G27 installation instructions for Node.js

1. Install the latest Node.js package from h ttps://nodejs.org/en/
2. Run a js test file (console.log(‘Hello World’) to verify node is properly installed
3. use npm (node Package Manager) to install
https://www.npmjs.com/package/logitech­g27
4. Run the test LED file to see if the communication between computer and the G27 Wheel is properly functioning.
Checkpoint: node can now successfully read and write to the G27 wheel.
5. use npm to install serial communication: npm install serialport
6. use an arduino and load serialwithforcetest.ino onto it.
7. try running serialwithforcetest.js through node
8. Great success!
