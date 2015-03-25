var SensorTag = require('./index');

function onDiscover(sensorTag) {
  console.log('discovered: ' + sensorTag.uuid + ', type = ' + sensorTag.type);
}

// SensorTag.discoverAll(onDiscover);

SensorTag.discoverByUuid('20d1a47d7bab4a89aa2b0d3cbb8372f5', onDiscover);

// SensorTag.discover(onDiscover);
