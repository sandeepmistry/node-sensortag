// http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide

var NobleDevice = require('noble-device');

var Common = require('./common');

var MPU9250_UUID                            = 'f000aa8004514000b000000000000000';
var BAROMETRIC_PRESSURE_UUID                = 'f000aa4004514000b000000000000000';
var IO_UUID                                 = 'f000aa6404514000b000000000000000';
var LUXOMETER_UUID                          = 'f000aa7004514000b000000000000000';

var BAROMETRIC_PRESSURE_CONFIG_UUID         = 'f000aa4204514000b000000000000000';

var MPU9250_CONFIG_UUID                     = 'f000aa8204514000b000000000000000';
var MPU9250_DATA_UUID                       = 'f000aa8104514000b000000000000000';
var MPU9250_PERIOD_UUID                     = 'f000aa8304514000b000000000000000';

var MPU9250_GYROSCOPE_MASK                  = 0x0007;
var MPU9250_ACCELEROMETER_MASK              = 0x0238;
var MPU9250_MAGNETOMETER_MASK               = 0x0040;

var IO_DATA_UUID                            = 'f000aa6504514000b000000000000000';
var IO_CONFIG_UUID                          = 'f000aa6604514000b000000000000000';

var LUXOMETER_CONFIG_UUID                   = 'f000aa7204514000b000000000000000';
var LUXOMETER_DATA_UUID                     = 'f000aa7104514000b000000000000000';
var LUXOMETER_PERIOD_UUID                   = 'f000aa7304514000b000000000000000';

var CC2650SensorTag = function(peripheral) {
  NobleDevice.call(this, peripheral);
  Common.call(this);

  this.type = 'cc2650';
  this.mpu9250mask = 0;
  this.mpu9250notifyCount = 0;

  this.onMPU9250ChangeBinded     = this.onMPU9250Change.bind(this);
  this.onLuxometerChangeBinded   = this.onLuxometerChange.bind(this);
};

CC2650SensorTag.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;

  return (localName === 'CC2650 SensorTag') ||
          (localName === 'SensorTag 2.0');
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
  // data is returned as
  // Firmare 0.89 16 bit single precision float
  // Firmare 1.01 24 bit single precision float

  var flTempBMP;
  var flPressure;

  if (data.length > 4) {
    // Firmware 1.01

    flTempBMP = (data.readUInt32LE(0) & 0x00ffffff)/ 100.0;
    flPressure = ((data.readUInt32LE(2) >> 8) & 0x00ffffff) / 100.0;
  } else {
    // Firmware 0.89

    var tempBMP = data.readUInt16LE(0);
    var tempExponent = (tempBMP & 0xF000) >> 12;
    var tempMantissa = (tempBMP & 0x0FFF);
    flTempBMP = tempMantissa * Math.pow(2, tempExponent) / 100.0;

    var tempPressure = data.readUInt16LE(2);
    var pressureExponent = (tempPressure & 0xF000) >> 12;
    var pressureMantissa = (tempPressure & 0x0FFF);
    flPressure = pressureMantissa * Math.pow(2, pressureExponent) / 100.0;
  }

  callback(flPressure);
};

CC2650SensorTag.prototype.setMPU9250Period = function(period, callback) {
  this.writePeriodCharacteristic(MPU9250_UUID, MPU9250_PERIOD_UUID, period, callback);
};

CC2650SensorTag.prototype.enableMPU9250 = function(mask, callback) {
  this.mpu9250mask |= mask;

  // for now, always write 0x007f, magnetometer does not seem to notify is specific mask is used
  this.writeUInt16LECharacteristic(MPU9250_UUID, MPU9250_CONFIG_UUID, 0x007f, callback);
};

CC2650SensorTag.prototype.disableMPU9250 = function(mask, callback) {
  this.mpu9250mask &= ~mask;

  if (this.mpu9250mask === 0) {
    this.writeUInt16LECharacteristic(MPU9250_UUID, MPU9250_CONFIG_UUID, 0x0000, callback);
  } else if (typeof(callback) === 'function') {
    callback();
  }
};

CC2650SensorTag.prototype.notifyMPU9250 = function(callback) {
  this.mpu9250notifyCount++;

  if (this.mpu9250notifyCount === 1) {
    this.notifyCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, true, this.onMPU9250ChangeBinded, callback);
  } else if (typeof(callback) === 'function') {
    callback();
  }
};

CC2650SensorTag.prototype.unnotifyMPU9250 = function(callback) {
  this.mpu9250notifyCount--;

  if (this.mpu9250notifyCount === 0) {
    this.notifyCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, false, this.onMPU9250ChangeBinded, callback);
  } else if (typeof(callback) === 'function') {
    callback();
  }
};

CC2650SensorTag.prototype.enableAccelerometer = function(callback) {
  this.enableMPU9250(MPU9250_ACCELEROMETER_MASK, callback);
};

CC2650SensorTag.prototype.disableAccelerometer = function(callback) {
  this.disableMPU9250(MPU9250_ACCELEROMETER_MASK, callback);
};

CC2650SensorTag.prototype.readAccelerometer  = function(callback) {
  this.readDataCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMPU9250Data(data, function(x, y, z) {
      callback(null, x, y, z);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.onMPU9250Change = function(data) {
  this.convertMPU9250Data(data, function(x, y, z, xG, yG, zG, xM, yM, zM) {
    if (this.mpu9250mask & MPU9250_ACCELEROMETER_MASK) {
      this.emit('accelerometerChange', x, y, z);
    }

    if (this.mpu9250mask & MPU9250_GYROSCOPE_MASK) {
      this.emit('gyroscopeChange', xG, yG, zG);
    }

    if (this.mpu9250mask & MPU9250_MAGNETOMETER_MASK) {
      this.emit('magnetometerChange', xM, yM, zM);
    }
  }.bind(this));
};

CC2650SensorTag.prototype.convertMPU9250Data = function(data, callback) {
  // 250 deg/s range
  var xG = data.readInt16LE(0) / 128.0;
  var yG = data.readInt16LE(2) / 128.0;
  var zG = data.readInt16LE(4) / 128.0;

  // we specify 8G range in setup
  var x = data.readInt16LE(6) / 4096.0;
  var y = data.readInt16LE(8) / 4096.0;
  var z = data.readInt16LE(10) / 4096.0;

  // magnetometer (page 50 of http://www.invensense.com/mems/gyro/documents/RM-MPU-9250A-00.pdf)
  var xM = data.readInt16LE(12) * 4912.0 / 32768.0;
  var yM = data.readInt16LE(14) * 4912.0 / 32768.0;
  var zM = data.readInt16LE(16) * 4912.0 / 32768.0;

  callback(x, y, z, xG, yG, zG, xM, yM, zM);
};

CC2650SensorTag.prototype.notifyAccelerometer = function(callback) {
  this.notifyMPU9250(callback);
};

CC2650SensorTag.prototype.unnotifyAccelerometer = function(callback) {
  this.unnotifyMPU9250(callback);
};

CC2650SensorTag.prototype.setAccelerometerPeriod = function(period, callback) {
  this.setMPU9250Period(period, callback);
};

CC2650SensorTag.prototype.enableMagnetometer = function(callback) {
  this.enableMPU9250(MPU9250_MAGNETOMETER_MASK, callback);
};

CC2650SensorTag.prototype.disableMagnetometer = function(callback) {
  this.disableMPU9250(MPU9250_MAGNETOMETER_MASK, callback);
};

CC2650SensorTag.prototype.readMagnetometer = function(callback) {
  this.readDataCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMPU9250Data(data, function(x, y, z, xG, yG, zG, xM, yM, zM) {
      callback(null, xM, yM, zM);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.notifyMagnetometer = function(callback) {
  this.notifyMPU9250(callback);
};

CC2650SensorTag.prototype.unnotifyMagnetometer = function(callback) {
  this.unnotifyMPU9250(callback);
};

CC2650SensorTag.prototype.setMagnetometerPeriod = function(period, callback) {
  this.setMPU9250Period(period, callback);
};

CC2650SensorTag.prototype.setGyroscopePeriod = function(period, callback) {
  this.setMPU9250Period(period, callback);
};

CC2650SensorTag.prototype.enableGyroscope = function(callback) {
  this.enableMPU9250(MPU9250_GYROSCOPE_MASK, callback);
};

CC2650SensorTag.prototype.disableGyroscope = function(callback) {
  this.disableMPU9250(MPU9250_GYROSCOPE_MASK, callback);
};

CC2650SensorTag.prototype.readGyroscope = function(callback) {
  this.readDataCharacteristic(MPU9250_UUID, MPU9250_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertMPU9250Data(data, function(x, y, z, xG, yG, zG) {
      callback(null, xG, yG, zG);
    }.bind(this));
  }.bind(this));
};

CC2650SensorTag.prototype.notifyGyroscope = function(callback) {
  this.notifyMPU9250(callback);
};

CC2650SensorTag.prototype.unnotifyGyroscope = function(callback) {
  this.unnotifyMPU9250(callback);
};

CC2650SensorTag.prototype.readIoData = function(callback) {
  this.readUInt8Characteristic(IO_UUID, IO_DATA_UUID, callback);
};

CC2650SensorTag.prototype.writeIoData = function(value, callback) {
  this.writeUInt8Characteristic(IO_UUID, IO_DATA_UUID, value, callback);
};

CC2650SensorTag.prototype.readIoConfig = function(callback) {
  this.readUInt8Characteristic(IO_UUID, IO_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.writeIoConfig = function(value, callback) {
  this.writeUInt8Characteristic(IO_UUID, IO_CONFIG_UUID, value, callback);
};

CC2650SensorTag.prototype.enableLuxometer = function(callback) {
  this.enableConfigCharacteristic(LUXOMETER_UUID, LUXOMETER_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.disableLuxometer = function(callback) {
  this.disableConfigCharacteristic(LUXOMETER_UUID, LUXOMETER_CONFIG_UUID, callback);
};

CC2650SensorTag.prototype.readLuxometer = function(callback) {
  this.readDataCharacteristic(LUXOMETER_UUID, LUXOMETER_DATA_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    this.convertLuxometerData(data, function(lux) {
      callback(null, lux);
    }.bind(this));
  }.bind(this));
 };

CC2650SensorTag.prototype.onLuxometerChange = function(data) {
  this.convertLuxometerData(data, function(lux) {
    this.emit('luxometerChange', lux);
  }.bind(this));
};

CC2650SensorTag.prototype.convertLuxometerData = function(data, callback) {
  var rawLux = data.readUInt16LE(0);

  var exponent = (rawLux & 0xF000) >> 12;
  var mantissa = (rawLux & 0x0FFF);

  var flLux = mantissa * Math.pow(2, exponent) / 100.0;

  callback(flLux);
};

CC2650SensorTag.prototype.notifyLuxometer = function(callback) {
  this.notifyCharacteristic(LUXOMETER_UUID, LUXOMETER_DATA_UUID, true, this.onLuxometerChangeBinded, callback);
};

CC2650SensorTag.prototype.unnotifyLuxometer = function(callback) {
  this.notifyCharacteristic(LUXOMETER_UUID, LUXOMETER_DATA_UUID, false, this.onLuxometerChangeBinded, callback);
};

CC2650SensorTag.prototype.setLuxometerPeriod = function(period, callback) {
  this.writePeriodCharacteristic(LUXOMETER_UUID, LUXOMETER_PERIOD_UUID, period, callback);
};

CC2650SensorTag.prototype.convertSimpleKeyData = function(data, callback) {
  var b = data.readUInt8(0);

  var left = (b & 0x2) ? true : false;
  var right = (b & 0x1) ? true : false;
  var reedRelay = (b & 0x4) ? true : false;

  callback(left, right, reedRelay);
};

module.exports = CC2650SensorTag;
