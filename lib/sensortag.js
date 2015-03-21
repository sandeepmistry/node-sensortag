var CC2540SensorTag = require('./cc2540');
var CC2650SensorTag = require('./cc2650');

var SensorTag = function() {
};

SensorTag.discover = function(callback) {
  var onDiscover = function(sensorTag) {
    CC2540SensorTag.stopDiscoverAll(onDiscover);
    CC2650SensorTag.stopDiscoverAll(onDiscover);

    callback(sensorTag);
  };

  CC2540SensorTag.discoverAll(onDiscover);
  CC2650SensorTag.discoverAll(onDiscover);
};

SensorTag.CC2540 = CC2540SensorTag;
SensorTag.CC2650 = CC2650SensorTag;

module.exports = SensorTag;
