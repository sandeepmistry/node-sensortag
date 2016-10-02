var SensorTag = require('./index');

function sensorTagDisovered(sensorTag) {
  console.log('discovered: ' + sensorTag);

  sensorTag.once('disconnect', function() {
    console.log('disconnected');
  });

  sensorTag.connectAndSetUp(function(err) {
    // restart discovery
    SensorTag.discover(sensorTagDisovered);

    if (err) {
      console.log('error occurred on connect or set up!');
      return;
    }

    console.log('connected');

    // do some stuff with the sensorTag ...
  });
}

// start discovery of a SensorTag
SensorTag.discover(sensorTagDisovered);
