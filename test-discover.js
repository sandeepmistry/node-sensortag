var SensorTag = require('./index');

function onDiscover(sensorTag) {
  console.log('discovered: ' + sensorTag.id + ', type = ' + sensorTag.type);
}

// SensorTag.discoverAll(onDiscover);

// SensorTag.discoverById('3d7bd14925ad4f69b73a98cbc998c4db', onDiscover);

// SensorTag.discoverByAddress('90:59:af:0a:ab:34', onDiscover);

SensorTag.discover(onDiscover);
