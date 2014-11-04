/*jshint loopfunc: true */
"use strict";

var debug = require('debug')('sensortag-node');
var events = require('events');
var util = require('util');

var noble = require('noble');

// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide
var GENERIC_ACCESS_UUID = '1800';
var GENERIC_ATTRIBUTE_UUID = '1801';
var DEVICE_INFORMATION_UUID = '180a';
var IR_TEMPERATURE_UUID = 'f000aa0004514000b000000000000000';
var ACCELEROMETER_UUID = 'f000aa1004514000b000000000000000';
var HUMIDITY_UUID = 'f000aa2004514000b000000000000000';
var MAGNETOMETER_UUID = 'f000aa3004514000b000000000000000';
var BAROMETRIC_PRESSURE_UUID = 'f000aa4004514000b000000000000000';
var GYROSCOPE_UUID = 'f000aa5004514000b000000000000000';
var SIMPLE_KEY_UUID = 'ffe0';
var TEST_UUID = 'f000aa6004514000b000000000000000';
var OAD_UUID = 'f000ffc004514000b000000000000000';
var BATTERY_UUID = '180f';

var DEVICE_NAME_UUID = '2a00';
var APPEARANCE_UUID = '2a01';
var PERIPHERAL_PRIVACY_FLAG_UUID = '2a02';
var RECONNECTION_ADDRESS_UUID = '2a03';
var PERIPHERAL_PREFERRED_CONNECTION_PARAMETERS_UUID = '2a04';

var SYSTEM_ID_UUID = '2a23';
var MODEL_NUMBER_UUID = '2a24';
var SERIAL_NUMBER_UUID = '2a25';
var FIRMWARE_REVISION_UUID = '2a26';
var HARDWARE_REVISION_UUID = '2a27';
var SOFTWARE_REVISION_UUID = '2a28';
var MANUFACTURER_NAME_UUID = '2a29';
var REGULATORY_CERTIFICATE_DATA_LIST_UUID = '2a2a';
var PNP_ID_UUID = '2a50';
var BATTERY_LEVEL_DATA_UUID = '2a19';

var IR_TEMPERATURE_CONFIG_UUID = 'f000aa0204514000b000000000000000';
var IR_TEMPERATURE_DATA_UUID = 'f000aa0104514000b000000000000000';

var ACCELEROMETER_CONFIG_UUID = 'f000aa1204514000b000000000000000';
var ACCELEROMETER_DATA_UUID = 'f000aa1104514000b000000000000000';
var ACCELEROMETER_PERIOD_UUID = 'f000aa1304514000b000000000000000';

var HUMIDITY_CONFIG_UUID = 'f000aa2204514000b000000000000000';
var HUMIDITY_DATA_UUID = 'f000aa2104514000b000000000000000';

var MAGNETOMETER_CONFIG_UUID = 'f000aa3204514000b000000000000000';
var MAGNETOMETER_DATA_UUID = 'f000aa3104514000b000000000000000';
var MAGNETOMETER_PERIOD_UUID = 'f000aa3304514000b000000000000000';

var BAROMETRIC_PRESSURE_CONFIG_UUID = 'f000aa4204514000b000000000000000';
var BAROMETRIC_PRESSURE_DATA_UUID = 'f000aa4104514000b000000000000000';
var BAROMETRIC_PRESSURE_CALIBRATION_UUID = 'f000aa4304514000b000000000000000';

var GYROSCOPE_CONFIG_UUID = 'f000aa5204514000b000000000000000';
var GYROSCOPE_DATA_UUID = 'f000aa5104514000b000000000000000';
var GYRO_PERIOD_UUID = 'f000aa5304514000b000000000000000';

var SIMPLE_KEY_DATA_UUID = 'ffe1';

function SensorTag(peripheral) {
	this._peripheral = peripheral;
	this._services = {};
	this._characteristics = {};
	this._bindings = {};

	//Attributes for restoration after a connection drop
	this._enabledNotifications = [];
	this._writtenCharacteristics = {};

	this.uuid = peripheral.uuid;
	//1.2 format
	this._fwVersion = 0;

	this._peripheral.on('connectionDrop', this.onConnectionDrop.bind(this));
	this._peripheral.on('disconnect', this.onDisconnect.bind(this));
	this._peripheral.on('connect', this.onConnect.bind(this));

	//Set all bindings - workaround to Nodejs events listener implementation : two same methods binded won't be
	//recognized as same listener
	this._bindings.onIrTemperatureChange = this.onIrTemperatureChange.bind(this);
	this._bindings.onGyroscopeChange = this.onGyroscopeChange.bind(this);
	this._bindings.onAccelerometerChange = this.onAccelerometerChange.bind(this);
	this._bindings.onHumidityChange = this.onHumidityChange.bind(this);
	this._bindings.onMagnetometerChange = this.onMagnetometerChange.bind(this);
	this._bindings.onBarometricPressureChange = this.onBarometricPressureChange.bind(this);
	this._bindings.onSimpleKeyChange = this.onSimpleKeyChange.bind(this);
	this._bindings.onBatteryLevelChange = this.onBatteryLevelChange.bind(this);
}

util.inherits(SensorTag, events.EventEmitter);

SensorTag.discover = function (callback, uuid) {
	var startScanningOnPowerOn = function () {
			if (noble.state === 'poweredOn') {
				var onDiscover = function (peripheral) {
						if (peripheral.advertisement.localName === 'SensorTag' && (uuid === undefined || uuid === peripheral.uuid)) {
							noble.removeListener('discover', onDiscover);
							noble.stopScanning();
							var sensorTag = new SensorTag(peripheral);
							callback(sensorTag);
						}
					};

				noble.on('discover', onDiscover);

				noble.startScanning();
			} else if (noble.state === 'unknown') {
                //Wait for adapter to be ready
				noble.once('stateChange', startScanningOnPowerOn);
			} else {
                throw new Error('Please be sure Bluetooth 4.0 supported / enabled on your system before trying to connect to sensortag-node');
            }
		};

	startScanningOnPowerOn();
};

SensorTag.prototype.onConnectionDrop = function () {
	this.emit('connectionDrop');
};

SensorTag.prototype.onReconnectAfterCharsDiscovery = function () {
	this.restoreCharsAndNotifs(function () {});
	this.emit('reconnect');
};

SensorTag.prototype.onReconnectDuringCharsDiscovery = function (callback) {
	this.discoverServicesAndCharacteristics(callback);
	this.emit('reconnect');
};

SensorTag.prototype.restoreCharsAndNotifs = function () {
	var emptyFunc = function () {},
		char_uuid,
		char_index;
	debug('restore sensor tag written characteristics and notifications after connection drop');

	//Try to restore written characteristics - listener have already been registered
	for (char_uuid in this._writtenCharacteristics) {
		if (this._writtenCharacteristics.hasOwnProperty(char_uuid)) {
			this._characteristics[char_uuid].write(this._writtenCharacteristics[char_uuid], false, emptyFunc);
		}
	}

	//Try to restore enabled notifications
	for (char_index = 0; char_index < this._enabledNotifications.length; char_index++) {
		this._enabledNotifications[char_index].notify(true, emptyFunc);
	}
	this.emit('reconnect');
};

SensorTag.prototype.onDisconnect = function () {
	this.emit('disconnect');
};

SensorTag.prototype.onConnect = function () {
	this.emit('connect');
};

SensorTag.prototype.toString = function () {
	return JSON.stringify({
		uuid: this.uuid
	});
};

SensorTag.prototype.connect = function (callback) {
	this._peripheral.connect(callback);
};

SensorTag.prototype.disconnect = function (callback) {
	//Empty data stored for reconnection
	this._enabledNotifications.length = 0;
	this._writtenCharacteristics = {};

	this._peripheral.disconnect(callback);
};

SensorTag.prototype.reconnect = function (callback) {
	this._peripheral.reconnect(callback);
};

SensorTag.prototype.discoverServicesAndCharacteristics = function (callback) {
    var index,
		currCharacteristic,
		currService;
	this._peripheral.removeAllListeners('reconnect');
	this._peripheral.on('reconnect', this.onReconnectDuringCharsDiscovery.bind(this, callback));

	this._peripheral.discoverAllServicesAndCharacteristics(function (error, services, characteristics) {
		if (error === null) {
			for (index = 0; index < services.length; index++) {
				currService = services[index];
				this._services[currService.uuid] = currService;
			}

			for (index = 0; index < characteristics.length; index++) {
				currCharacteristic = characteristics[index];
				this._characteristics[currCharacteristic.uuid] = currCharacteristic;
			}
		}

		//Read FW revision
		this.readFirmwareRevision(function (fwVersion) {
			this._fwVersion = parseFloat(fwVersion.split(' ')[0]);
		}.bind(this));

		this._peripheral.removeAllListeners('reconnect');
		this._peripheral.on('reconnect', this.onReconnectAfterCharsDiscovery.bind(this));
		callback();
	}.bind(this));
};

SensorTag.prototype.writeCharacteristic = function (uuid, data, callback) {
	this._characteristics[uuid].write(data, false, function () {
		//Keep written characteristics for a possible restoration
		this._writtenCharacteristics[uuid] = data;
		callback();
	}.bind(this));
};

SensorTag.prototype.writePeriodCharacteristic = function (uuid, period, callback) {
	period /= 10; // input is scaled by units of 10ms
	if (period < 10) {
		period = 10;
	} else if (period > 255) {
		period = 255;
	}

	this.writeCharacteristic(uuid, new Buffer([period]), callback);
};

SensorTag.prototype.notifyCharacteristic = function (uuid, notify, listener, callback) {
	var characteristic = this._characteristics[uuid];
	if (characteristic === undefined) {
		//TODO throw error
		debug('characteristic with uuid ' + uuid + ' not supported by sensortag');
		callback();
	} else {
		characteristic.notify(notify, function () {
			if (notify) {
				characteristic.on('read', listener);
				//Keep notification state for a possible restoration
				this._enabledNotifications.push(characteristic);
			} else {
				characteristic.removeListener('read', listener);
				//Remove from notification array if notification have been disabled
				var charIndex = this._enabledNotifications.indexOf(characteristic);
				if (charIndex !== -1) {
					this._enabledNotifications.splice(charIndex, 1);
				}
			}
			callback();
		}.bind(this));
	}
};

SensorTag.prototype.enableConfigCharacteristic = function (uuid, callback) {
	this.writeCharacteristic(uuid, new Buffer([0x01]), callback);
};

SensorTag.prototype.disableConfigCharacteristic = function (uuid, callback) {
	this.writeCharacteristic(uuid, new Buffer([0x00]), callback);
};

SensorTag.prototype.readDataCharacteristic = function (uuid, callback) {
	if (this._characteristics[uuid] === undefined) {
		debug('characteristic with uuid ' + uuid + ' not supported by sensortag');
	} else {
		this._characteristics[uuid].read(function (error, data) {
            callback(data);
        });
    }
};

SensorTag.prototype.readStringCharacteristic = function (uuid, callback) {
	this.readDataCharacteristic(uuid, function (data) {
		callback(data.toString());
	});
};

SensorTag.prototype.readDeviceName = function (callback) {
	this.readStringCharacteristic(DEVICE_NAME_UUID, callback);
};

SensorTag.prototype.readSystemId = function (callback) {
	this.readDataCharacteristic(SYSTEM_ID_UUID, function (data) {
		var systemId = [
			data.readUInt8(7).toString(16),
			data.readUInt8(6).toString(16),
			data.readUInt8(5).toString(16),
			data.readUInt8(4).toString(16),
			data.readUInt8(3).toString(16),
			data.readUInt8(2).toString(16),
			data.readUInt8(2).toString(16),
			data.readUInt8(0).toString(16)
		].join(':');

		callback(systemId);
	});
};

SensorTag.prototype.readModelNumber = function (callback) {
	this.readStringCharacteristic(MODEL_NUMBER_UUID, callback);
};

SensorTag.prototype.readSerialNumber = function (callback) {
	this.readStringCharacteristic(SERIAL_NUMBER_UUID, callback);
};

SensorTag.prototype.readFirmwareRevision = function (callback) {
	this.readStringCharacteristic(FIRMWARE_REVISION_UUID, callback);
};

SensorTag.prototype.readHardwareRevision = function (callback) {
	this.readStringCharacteristic(HARDWARE_REVISION_UUID, callback);
};

SensorTag.prototype.readSoftwareRevision = function (callback) {
	this.readStringCharacteristic(SOFTWARE_REVISION_UUID, callback);
};

SensorTag.prototype.readManufacturerName = function (callback) {
	this.readStringCharacteristic(MANUFACTURER_NAME_UUID, callback);
};

SensorTag.prototype.enableIrTemperature = function (callback) {
	this.enableConfigCharacteristic(IR_TEMPERATURE_CONFIG_UUID, callback);
};

SensorTag.prototype.disableIrTemperature = function (callback) {
	this.disableConfigCharacteristic(IR_TEMPERATURE_CONFIG_UUID, callback);
};

SensorTag.prototype.readIrTemperature = function (callback) {
	this.readDataCharacteristic(IR_TEMPERATURE_DATA_UUID, function (data) {
		this.convertIrTemperatureData(data, callback);
	}.bind(this));
};

SensorTag.prototype.onIrTemperatureChange = function (data) {
	this.convertIrTemperatureData(data, function (objectTemperature, ambientTemperature) {
		this.emit('irTemperatureChange', objectTemperature, ambientTemperature);
	}.bind(this));
};

SensorTag.prototype.convertIrTemperatureData = function (data, callback) {
	// For computation refer :  http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#IR_Temperature_Sensor
	var ambientTemperature = data.readInt16LE(2) / 128.0,
        Vobj2 = data.readInt16LE(0) * 0.00000015625,
        Tdie2 = ambientTemperature + 273.15,
        S0 = 5.593 * Math.pow(10, -14),
        a1 = 1.75 * Math.pow(10, -3),
        a2 = -1.678 * Math.pow(10, -5),
        b0 = -2.94 * Math.pow(10, -5),
        b1 = -5.7 * Math.pow(10, -7),
        b2 = 4.63 * Math.pow(10, -9),
        c2 = 13.4,
        Tref = 298.15,
        S = S0 * (1 + a1 * (Tdie2 - Tref) + a2 * Math.pow((Tdie2 - Tref), 2)),
        Vos = b0 + b1 * (Tdie2 - Tref) + b2 * Math.pow((Tdie2 - Tref), 2),
        fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2),
        objectTemperature = Math.pow(Math.pow(Tdie2, 4) + (fObj / S), 0.25);

    objectTemperature = (objectTemperature - 273.15);

    callback(objectTemperature, ambientTemperature);
};

SensorTag.prototype.notifyIrTemperature = function (callback) {
	this.notifyCharacteristic(IR_TEMPERATURE_DATA_UUID, true, this._bindings.onIrTemperatureChange, callback);
};

SensorTag.prototype.unnotifyIrTemperature = function (callback) {
	this.notifyCharacteristic(IR_TEMPERATURE_DATA_UUID, false, this._bindings.onIrTemperatureChange, callback);
};

SensorTag.prototype.enableAccelerometer = function (callback) {
	this.enableConfigCharacteristic(ACCELEROMETER_CONFIG_UUID, callback);
};

SensorTag.prototype.disableAccelerometer = function (callback) {
	this.disableConfigCharacteristic(ACCELEROMETER_CONFIG_UUID, callback);
};

SensorTag.prototype.readAccelerometer = function (callback) {
	this.readDataCharacteristic(ACCELEROMETER_DATA_UUID, function (data) {
		this.convertAccelerometerData(data, callback);
	}.bind(this));
};

SensorTag.prototype.onAccelerometerChange = function (data) {
	this.convertAccelerometerData(data, function (x, y, z) {
		this.emit('accelerometerChange', x, y, z);
	}.bind(this));
};

SensorTag.prototype.convertAccelerometerData = function (data, callback) {
	var accelerometerFactor,
        x,
        y,
        z;
	if (this._fwVersion >= 1.4) {
		accelerometerFactor = 16;
	} else {
		accelerometerFactor = 4;
	}

    x = data.readInt8(0) * accelerometerFactor / 256.0;
	y = data.readInt8(1) * accelerometerFactor / 256.0;
	z = data.readInt8(2) * accelerometerFactor / 256.0;

	callback(x, y, z);
};

SensorTag.prototype.notifyAccelerometer = function (callback) {
	this.notifyCharacteristic(ACCELEROMETER_DATA_UUID, true, this._bindings.onAccelerometerChange, callback);
};

SensorTag.prototype.unnotifyAccelerometer = function (callback) {
	this.notifyCharacteristic(ACCELEROMETER_DATA_UUID, false, this._bindings.onAccelerometerChange, callback);
};

SensorTag.prototype.setAccelerometerPeriod = function (period, callback) {
	this.writePeriodCharacteristic(ACCELEROMETER_PERIOD_UUID, period, callback);
};

SensorTag.prototype.enableHumidity = function (callback) {
	this.enableConfigCharacteristic(HUMIDITY_CONFIG_UUID, callback);
};

SensorTag.prototype.disableHumidity = function (callback) {
	this.disableConfigCharacteristic(HUMIDITY_CONFIG_UUID, callback);
};

SensorTag.prototype.readHumidity = function (callback) {
	this.readDataCharacteristic(HUMIDITY_DATA_UUID, function (data) {
		this.convertHumidityData(data, callback);
	}.bind(this));
};

SensorTag.prototype.onHumidityChange = function (data) {
	this.convertHumidityData(data, function (temperature, humidity) {
		this.emit('humidityChange', temperature, humidity);
	}.bind(this));
};

SensorTag.prototype.convertHumidityData = function (data, callback) {
	var temperature = -46.85 + 175.72 / 65536.0 * data.readUInt16LE(0);
	var humidity = -6.0 + 125.0 / 65536.0 * (data.readUInt16LE(2) & ~0x0003);

	callback(temperature, humidity);
};

SensorTag.prototype.notifyHumidity = function (callback) {
	this.notifyCharacteristic(HUMIDITY_DATA_UUID, true, this._bindings.onHumidityChange, callback);
};

SensorTag.prototype.unnotifyHumidity = function (callback) {
	this.notifyCharacteristic(HUMIDITY_DATA_UUID, false, this._bindings.onHumidityChange, callback);
};

SensorTag.prototype.enableMagnetometer = function (callback) {
	this.enableConfigCharacteristic(MAGNETOMETER_CONFIG_UUID, callback);
};

SensorTag.prototype.disableMagnetometer = function (callback) {
	this.disableConfigCharacteristic(MAGNETOMETER_CONFIG_UUID, callback);
};

SensorTag.prototype.readMagnetometer = function (callback) {
	this.readDataCharacteristic(MAGNETOMETER_DATA_UUID, function (data) {
		this.convertMagnetometerData(data, callback);
	}.bind(this));
};

SensorTag.prototype.onMagnetometerChange = function (data) {
	this.convertMagnetometerData(data, function (x, y, z) {
		this.emit('magnetometerChange', x, y, z);
	}.bind(this));
};

SensorTag.prototype.convertMagnetometerData = function (data, callback) {
	var x = data.readInt16LE(0) * 2000.0 / 65536.0;
	var y = data.readInt16LE(2) * 2000.0 / 65536.0;
	var z = data.readInt16LE(4) * 2000.0 / 65536.0;

	callback(x, y, z);
};

SensorTag.prototype.notifyMagnetometer = function (callback) {
	this.notifyCharacteristic(MAGNETOMETER_DATA_UUID, true, this._bindings.onMagnetometerChange, callback);
};

SensorTag.prototype.unnotifyMagnetometer = function (callback) {
	this.notifyCharacteristic(MAGNETOMETER_DATA_UUID, false, this._bindings.onMagnetometerChange, callback);
};

SensorTag.prototype.setMagnetometerPeriod = function (period, callback) {
	this.writePeriodCharacteristic(MAGNETOMETER_PERIOD_UUID, period, callback);
};

SensorTag.prototype.enableBarometricPressure = function (callback) {
	this.writeCharacteristic(BAROMETRIC_PRESSURE_CONFIG_UUID, new Buffer([0x02]), function () {
		this.readDataCharacteristic(BAROMETRIC_PRESSURE_CALIBRATION_UUID, function (data) {
			this._barometricPressureCalibrationData = data;

			this.enableConfigCharacteristic(BAROMETRIC_PRESSURE_CONFIG_UUID, callback);
		}.bind(this));
	}.bind(this));
};

SensorTag.prototype.disableBarometricPressure = function (callback) {
	this.disableConfigCharacteristic(BAROMETRIC_PRESSURE_CONFIG_UUID, callback);
};

SensorTag.prototype.readBarometricPressure = function (callback) {
	this.readDataCharacteristic(BAROMETRIC_PRESSURE_DATA_UUID, function (data) {
		this.convertBarometricPressureData(data, callback);
	}.bind(this));
};

SensorTag.prototype.onBarometricPressureChange = function (data) {
	this.convertBarometricPressureData(data, function (pressure) {
		this.emit('barometricPressureChange', pressure);
	}.bind(this));
};

SensorTag.prototype.convertBarometricPressureData = function (data, callback) {

	// For computation refer :  http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Barometric_Pressure_Sensor_2
	var temp; // Temperature raw value from sensor
	var pressure; // Pressure raw value from sensor
	//var t_a; 	// Temperature actual value in unit centi degrees celsius
	var S; // Interim value in calculation
	var O; // Interim value in calculation
	var pA; // Pressure actual value in unit Pascal.
	var c0 = this._barometricPressureCalibrationData.readUInt16LE(0);
	var c1 = this._barometricPressureCalibrationData.readUInt16LE(2);
	var c2 = this._barometricPressureCalibrationData.readUInt16LE(4);
	var c3 = this._barometricPressureCalibrationData.readUInt16LE(6);

	var c4 = this._barometricPressureCalibrationData.readInt16LE(8);
	var c5 = this._barometricPressureCalibrationData.readInt16LE(10);
	var c6 = this._barometricPressureCalibrationData.readInt16LE(12);
	var c7 = this._barometricPressureCalibrationData.readInt16LE(14);

	temp = data.readInt16LE(0);
	pressure = data.readUInt16LE(2);

	//var t_a = (100.0 * (c0 * temp / 256.0 + c1* 64.0)) / 65536.0;
	S = c2 + ((c3 * temp) / 131072.0) + ((c4 * (temp * temp)) / 17179869184.0);
	O = (c5 * 16384.0) + (((c6 * temp) / 8)) + ((c7 * (temp * temp)) / 524288.0);
	pA = (((S * pressure) + O) / 16384.0);

	pA /= 100.0;

	callback(pA);
};

SensorTag.prototype.notifyBarometricPressure = function (callback) {
	this.notifyCharacteristic(BAROMETRIC_PRESSURE_DATA_UUID, true, this._bindings.onBarometricPressureChange, callback);
};

SensorTag.prototype.unnotifyBarometricPressure = function (callback) {
	this.notifyCharacteristic(BAROMETRIC_PRESSURE_DATA_UUID, false, this._bindings.onBarometricPressureChange, callback);
};

SensorTag.prototype.enableGyroscope = function (callback) {
	var enableCode = this.buildGyroscopeEnableCode(true, true, true);
	this.writeCharacteristic(GYROSCOPE_CONFIG_UUID, new Buffer([enableCode]), callback);
};

SensorTag.prototype.enableGyroscopeAxis = function (enableXAxis, enableYAxis, enableZAxis, callback) {
	var enableCode = this.buildGyroscopeEnableCode(enableXAxis, enableYAxis, enableZAxis);
	this.writeCharacteristic(GYROSCOPE_CONFIG_UUID, new Buffer([enableCode]), callback);
};

SensorTag.prototype.disableGyroscope = function (callback) {
	this.disableConfigCharacteristic(GYROSCOPE_CONFIG_UUID, callback);
};

SensorTag.prototype.readGyroscope = function (callback) {
	this.readDataCharacteristic(GYROSCOPE_DATA_UUID, function (data) {
		this.convertGyroscopeData(data, callback);
	}.bind(this));
};

SensorTag.prototype.onGyroscopeChange = function (data) {
	this.convertGyroscopeData(data, function (x, y, z) {
		this.emit('gyroscopeChange', x, y, z);
	}.bind(this));
};

SensorTag.prototype.buildGyroscopeEnableCode = function (enableXAxis, enableYAxis, enableZAxis) {
	var enableCode = 0;

	if (enableXAxis) {
		enableCode |= 0x01;
	}
	if (enableYAxis) {
		enableCode |= 0x02;
	}
	if (enableZAxis) {
		enableCode |= 0x04;
	}

	return enableCode;
};

SensorTag.prototype.convertGyroscopeData = function (data, callback) {
	var x = data.readInt16LE(0) * (500.0 / 65536.0) * -1;
	var y = data.readInt16LE(2) * (500.0 / 65536.0);
	var z = data.readInt16LE(4) * (500.0 / 65536.0);

	callback(x, y, z);
};

SensorTag.prototype.notifyGyroscope = function (callback) {
	this.notifyCharacteristic(GYROSCOPE_DATA_UUID, true, this._bindings.onGyroscopeChange, callback);
};

SensorTag.prototype.unnotifyGyroscope = function (callback) {
	this.notifyCharacteristic(GYROSCOPE_DATA_UUID, false, this._bindings.onGyroscopeChange, callback);
};

SensorTag.prototype.setGyroscopePeriod = function (period, callback) {
	//TODO gyro period on 1.3?
	this.writePeriodCharacteristic(GYRO_PERIOD_UUID, period, callback);
};

SensorTag.prototype.onSimpleKeyChange = function (data) {
	this.convertSimpleKeyData(data, function (left, right) {
		this.emit('simpleKeyChange', left, right);
	}.bind(this));
};

SensorTag.prototype.convertSimpleKeyData = function (data, callback) {
	var b = data.readUInt8(0);

	var left = (b & 0x2) ? true : false;
	var right = (b & 0x1) ? true : false;

	callback(left, right);
};

SensorTag.prototype.notifySimpleKey = function (callback) {
	this.notifyCharacteristic(SIMPLE_KEY_DATA_UUID, true, this._bindings.onSimpleKeyChange, callback);
};

SensorTag.prototype.unnotifySimpleKey = function (callback) {
	this.notifyCharacteristic(SIMPLE_KEY_DATA_UUID, false, this._bindings.onSimpleKeyChange, callback);
};

SensorTag.prototype.readBatteryLevel = function (callback) {
	this.readDataCharacteristic(BATTERY_LEVEL_DATA_UUID, function (data) {
		if(data.length == 1){
			this.convertBatteryLevelData(data, callback);
		}
		else
		{
			callback(new Error('unable to get battery level'));
		}
	}.bind(this));
};

SensorTag.prototype.convertBatteryLevelData = function (data, callback) {
	//Level in % on 1 byte
	var level = data.readInt8(0);
	callback(level);
};

SensorTag.prototype.onBatteryLevelChange = function (data) {
	this.convertBatteryLevelData(data, function (level) {
		this.emit('batteryLevelChange', level);
	}.bind(this));
};

SensorTag.prototype.notifyBatteryLevel = function (callback) {
	this.notifyCharacteristic(BATTERY_LEVEL_DATA_UUID, true, this._bindings.onBatteryLevelChange, callback);
};

SensorTag.prototype.unnotifyBatteryLevel = function (callback) {
	this.notifyCharacteristic(BATTERY_LEVEL_DATA_UUID, false, this._bindings.onBatteryLevelChange, callback);
};


module.exports = SensorTag;
