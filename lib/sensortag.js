var CC2540SensorTag = require('./cc2540');
var CC2650SensorTag = require('./cc2650');

var SensorTag = function() {
};

SensorTag.discoverAll = function(onDiscover) {
  CC2540SensorTag.discoverAll(onDiscover);
  CC2650SensorTag.discoverAll(onDiscover);
};

SensorTag.stopDiscoverAll = function(onDiscover) {
  CC2540SensorTag.stopDiscoverAll(onDiscover);
  CC2650SensorTag.stopDiscoverAll(onDiscover);
};

SensorTag.discover = function(callback) {
  var onDiscover = function(sensorTag) {
    SensorTag.stopDiscoverAll(onDiscover);

    callback(sensorTag);
  };

  SensorTag.discoverAll(onDiscover);
};

SensorTag.discoverByUuid = function(uuid, callback) {
  var onDiscoverByUuid = function(sensorTag) {
    if (sensorTag.uuid === uuid) {
      SensorTag.stopDiscoverAll(onDiscoverByUuid);

      callback(sensorTag);
    }
  };

  SensorTag.discoverAll(onDiscoverByUuid);
};

SensorTag.CC2540 = CC2540SensorTag;
SensorTag.CC2650 = CC2650SensorTag;

module.exports = SensorTag;
