var SensorTag = require('./index');

function onDiscover(sensorTag) {
  console.log('discovered: ' + sensorTag.id + ', type = ' + sensorTag.type);
}

// SensorTag.discoverAll(onDiscover);

SensorTag.discoverById('20d1a47d7bab4a89aa2b0d3cbb8372f5', onDiscover);

// SensorTag.discoverByAddress('90:59:af:0a:ab:34', onDiscover);

SensorTag.discover(onDiscover);
