var util = require('util');

var async = require('async');

var CC2650SensorTag = require('./index').CC2650;

var USE_READ = true;

CC2650SensorTag.discover(function(sensorTag) {
  console.log('discovered: ' + sensorTag);

  sensorTag.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });

  async.series([
      function(callback) {
        console.log('connectAndSetUp');
        sensorTag.connectAndSetUp(callback);
      },
      // http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide#IO_Service
      function(callback) {
        console.log('IO off');
        sensorTag.writeIoData(0, callback);
      },
      function(callback) {
        console.log('writeIoConfig');
        sensorTag.writeIoConfig(1, callback);
      },
      function(callback) {
        console.log('LED red');
        sensorTag.writeIoData(1, function() {
          setTimeout(callback, 1000);
        });
      },
      function(callback) {
        console.log('LED green');
        sensorTag.writeIoData(2, function() {
          setTimeout(callback, 1000);
        });
      },
      function(callback) {
        console.log('buzzer');
        sensorTag.writeIoData(4, function() {
          setTimeout(callback, 1000);
        });
      },
      function(callback) {
        console.log('IO off');
        sensorTag.writeIoData(0, callback);
      },
      function(callback) {
        console.log('disconnect');
        sensorTag.disconnect(callback);
      }
    ]
  );
});
