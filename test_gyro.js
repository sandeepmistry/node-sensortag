var util = require('util');
var debug = require('debug')('test_gyro');
var async = require('async');

var SensorTag = require('./index');

debug('starting test_gyro');
SensorTag.discover(function (sensorTag) {
	sensorTag.on('disconnect', function () {
		debug('disconnected!');
	});

	sensorTag.on('connectionDrop', function () {
		console.log('connection drop! - reconnect');
		sensorTag.reconnect();
	});

	sensorTag.on('reconnect', function () {
		debug('successfully reconnected!');
	});


	async.series([
		function (callback) {
		debug('connect');
		sensorTag.connect(callback);
	},
		function (callback) {
		debug('discoverServicesAndCharacteristics');
		sensorTag.discoverServicesAndCharacteristics(callback);
	},
		function (callback) {
		debug('readDeviceName');
		sensorTag.readDeviceName(function (deviceName) {
			debug('\tdevice name = ' + deviceName);
			callback();
		});
	},
		function (callback) {
		debug('readSystemId');
		sensorTag.readSystemId(function (systemId) {
			debug('\tsystem id = ' + systemId);
			callback();
		});
	},
		function (callback) {
		debug('readSerialNumber');
		sensorTag.readSerialNumber(function (serialNumber) {
			debug('\tserial number = ' + serialNumber);
			callback();
		});
	},
		function (callback) {
		debug('readFirmwareRevision');
		sensorTag.readFirmwareRevision(function (firmwareRevision) {
			debug('\tfirmware revision = ' + firmwareRevision);
			callback();
		});
	},
		function (callback) {
		debug('readHardwareRevision');
		sensorTag.readHardwareRevision(function (hardwareRevision) {
			debug('\thardware revision = ' + hardwareRevision);
			callback();
		});
	},
		function (callback) {
		debug('readSoftwareRevision');
		sensorTag.readHardwareRevision(function (softwareRevision) {
			debug('\tsoftware revision = ' + softwareRevision);
			callback();
		});
	},
		function (callback) {
		debug('readManufacturerName');
		sensorTag.readManufacturerName(function (manufacturerName) {
			debug('\tmanufacturer name = ' + manufacturerName);
			callback();
		});
	},

		function (callback) {
		debug('enableGyroscope');
		sensorTag.enableGyroscope(function () {
			//1000 corresponds to 100ms
			sensorTag.setGyroscopePeriod(1000, function () {
				callback();
			});
		});
	},
		function (callback) {
		setTimeout(callback, 1000);
	},
		function (callback) {
		sensorTag.on('gyroscopeChange', function (x, y, z) {
			debug('\tx = %d °/s - y = %d °/s - z = %d °/s', x.toFixed(1), y.toFixed(1), z.toFixed(1));
		});
		sensorTag.notifyGyroscope(function () {
			callback();
		});
	},
		function (callback) {
		setTimeout(callback, 100000);
	},
		function (callback) {
		sensorTag.disableGyroscope(function () {
			debug('Gyroscope disabled');
			setTimeout(callback, 1000);
		});
	},
		function (callback) {
		sensorTag.unnotifyGyroscope(function () {
			callback();
		});
	},
		function (callback) {
		sensorTag.notifyGyroscope(function () {
			callback();
		});
	},
		function (callback) {
		debug('enableGyroscope');
		sensorTag.enableGyroscope(function () {
			//2000 is value corresponding to 200ms
			sensorTag.setGyroscopePeriod(2000, function () {
				callback();
			});
		});
	},
		function (callback) {
		setTimeout(callback, 1000);
	},
		function (callback) {
		sensorTag.disableGyroscope(function () {
			debug('Gyroscope disabled');
			callback();
		});
	},
		function (callback) {
		sensorTag.disconnect(function () {
			debug('sensor tag disconnected');
			callback();
		});
	},
		], function (err) { //This function gets called after the two tasks have called their "task callbacks"
		if (err) {
			debug('test failed error : ' + err);
			process.exit(1);
		}
		debug('test of gyro SUCCESSFUL');
		process.exit(0);
	});

});
