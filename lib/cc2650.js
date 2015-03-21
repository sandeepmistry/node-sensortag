var NobleDevice = require('noble-device');

var Common = require('./common');

var CC2650SensorTag = function(peripheral) {
  NobleDevice.call(this, peripheral);
  Common.call(this);

  this.type = 'cc2650';
};

CC2650SensorTag.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;

  return (localName === 'CC2650 SensorTag');
};

NobleDevice.Util.inherits(CC2650SensorTag, NobleDevice);
NobleDevice.Util.mixin(CC2650SensorTag, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(CC2650SensorTag, Common);

CC2650SensorTag.prototype.convertIrTemperatureData = function(data, callback) {
  var ambientTemperature = data.readInt16LE(2) / 128.0;
  var objectTemperature = data.readInt16LE(0) / 128.0;

  callback(objectTemperature, ambientTemperature);
};

CC2650SensorTag.prototype.convertHumidityData = function(data, callback) {
  var temperature = -40 + ((165  * data.readUInt16LE(0)) / 65536.0);
  var humidity = data.readUInt16LE(2) * 100 / 65536.0;

  callback(temperature, humidity);
};

module.exports = CC2650SensorTag;
