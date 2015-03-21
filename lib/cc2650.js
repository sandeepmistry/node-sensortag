var NobleDevice = require('noble-device');

var Common = require('./common');

var ACC_GYRO_UUID                           = 'f000aa8004514000b000000000000000';
var BAROMETRIC_PRESSURE_UUID                = 'f000aa4004514000b000000000000000';

var BAROMETRIC_PRESSURE_CONFIG_UUID         = 'f000aa4204514000b000000000000000';

var CC2650SensorTag = function(peripheral) {
  NobleDevice.call(this, peripheral);
  Common.call(this);

  this.type = 'cc2650';
};

CC2650SensorTag.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;

  return (localName === 'CC2650 SensorTag') ||
          (localName === 'Sensor Tag 2.0');
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

CC2650SensorTag.prototype.enableBarometricPressure = function(callback) {
  this.enableConfigCharacteristic(BAROMETRIC_PRESSURE_UUID, BAROMETRIC_PRESSURE_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.convertBarometricPressureData = function(data, callback) {
  var tempBMP;     // Temperature processed value from sensor
  var pressure; // Pressure processed value from sensor

  // data is returned as 16 bit single precision float, convert to float
  // no idea at moment why divide by 10000 and not 100
  var exponent;
  var mantissa;

  var flTempBMP;
  var flPressure;
  tempBMP = data.readUInt16LE(0);

  exponent = (tempBMP & 0xF000) >> 12;
  mantissa = (tempBMP & 0x0FFF);

  flTempBMP = mantissa * Math.pow(2, exponent) / 10000;

  pressure = data.readUInt16LE(2);

  exponent = (pressure & 0xF000) >> 12;
  mantissa = (pressure & 0x0FFF);
  flPressure = mantissa * Math.pow(2, exponent) / 10000;

  callback(/*flTempBMP,*/ flPressure);
};

module.exports = CC2650SensorTag;
