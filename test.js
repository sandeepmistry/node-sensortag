var util = require('util');

var async = require('async');

var SensorTag = require('./index');

SensorTag.discover(function(sensorTag) {

  sensorTag.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });
  
  sensorTag.on('connectionDrop', function() {
    console.log('connection drop! - try to reconnect sensortag');
    sensorTag.reconnect();
  });

  async.series([
      function(callback) {
        console.log('connect');
        sensorTag.connect(callback);
      },
      function(callback) {
        console.log('discoverServicesAndCharacteristics');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected during discovery!');
		  sensorTag.discoverServicesAndCharacteristics(callback);
		});
        sensorTag.discoverServicesAndCharacteristics(callback);
      },
      function(callback) {
        console.log('readDeviceName');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading device name!');
		  sensorTag.readDeviceName(function(deviceName) {
		    console.log('\tdevice name = ' + deviceName);
		    callback();
          });
		});
        sensorTag.readDeviceName(function(deviceName) {
          console.log('\tdevice name = ' + deviceName);
          callback();
        });
      },
      function(callback) {
        console.log('readSystemId');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading system id!');
		  sensorTag.readSystemId(function(systemId) {
		    console.log('\tsystem id = ' + systemId);
            callback();
          });
		});
        sensorTag.readSystemId(function(systemId) {
          console.log('\tsystem id = ' + systemId);
          callback();
        });
      },
      function(callback) {
        console.log('readSerialNumber');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading serial number!');
		  sensorTag.readSerialNumber(function(serialNumber) {
		    console.log('\tserial number = ' + serialNumber);
		    callback();
		  });
		});
        sensorTag.readSerialNumber(function(serialNumber) {
          console.log('\tserial number = ' + serialNumber);
          callback();
        });
      },
      function(callback) {
        console.log('readFirmwareRevision');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading firmware version!');
		  sensorTag.readFirmwareRevision(function(firmwareRevision) {
            console.log('\tfirmware revision = ' + firmwareRevision);
            callback();
          });
		});
        sensorTag.readFirmwareRevision(function(firmwareRevision) {
          console.log('\tfirmware revision = ' + firmwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readHardwareRevision');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading hardware version!');
		  sensorTag.readHardwareRevision(function(hardwareRevision) {
            console.log('\thardware revision = ' + hardwareRevision);
            callback();
          });
		});
        sensorTag.readHardwareRevision(function(hardwareRevision) {
          console.log('\thardware revision = ' + hardwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readSoftwareRevision');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading software version!');
		  sensorTag.readSoftwareRevision(function(softwareRevision) {
		    console.log('\tsoftware revision = ' + softwareRevision);
		    callback();
	     });
		});
        sensorTag.readSoftwareRevision(function(softwareRevision) {
          console.log('\tsoftware revision = ' + softwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readManufacturerName');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading manufacturer name!');
		  sensorTag.readManufacturerName(function(manufacturerName) {
            console.log('\tmanufacturer name = ' + manufacturerName);
            callback();
          });
		});
        sensorTag.readManufacturerName(function(manufacturerName) {
          console.log('\tmanufacturer name = ' + manufacturerName);
          callback();
        });
      },
      function(callback) {
        console.log('enableIrTemperature');
		sensorTag.removeAllListeners('reconnect');
		sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading manufacturer name!');
		  sensorTag.enableIrTemperature(callback);
		});
        sensorTag.enableIrTemperature(callback);
      },
      function(callback) {
	    sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected!');
		  setTimeout(callback, 2000);
		});
        setTimeout(callback, 2000);
      },
      function(callback) {
        console.log('readIrTemperature');
		var readTemp = function(cb){
		  sensorTag.readIrTemperature(function(objectTemperature, ambientTemperature) {
            console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
            console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
            cb();
          });
		};
		
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading temp!');
		  readTemp(callback);
		});
		readTemp(callback);



        // sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature) {
        //   console.log('\tobejct temperature = %d °C', objectTemperature.toFixed(1));
        //   console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1))
        // });

        // sensorTag.notifyIrTemperature(function() {

        // });
      },
      function(callback) {
        console.log('disableAccelerometer');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when disabling accerlero!');
		  sensorTag.disableAccelerometer(callback);
		});
        sensorTag.disableAccelerometer(callback);
      },
      function(callback) {
        console.log('enableAccelerometer');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when enabling accerlero!');
		  sensorTag.enableAccelerometer(callback);
		});
        sensorTag.enableAccelerometer(callback);
      },
      function(callback) {
	    sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected!');
		  setTimeout(callback, 2000);
		});
        setTimeout(callback, 2000);
      },
      function(callback) {
        console.log('readAccelerometer');
		var readAccelero = function(cb){
          sensorTag.readAccelerometer(function(x, y, z) {
            console.log('\tx = %d G', x.toFixed(1));
            console.log('\ty = %d G', y.toFixed(1));
            console.log('\tz = %d G', z.toFixed(1));
            cb();
          });
		};
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading accerlero!');
		  readAccelero(callback);
		});
		readAccelero(callback);
        // sensorTag.on('accelerometerChange', function(x, y, z) {
        //   console.log('\tx = %d G', x.toFixed(1));
        //   console.log('\ty = %d G', y.toFixed(1));
        //   console.log('\tz = %d G', z.toFixed(1));
        // });

        // sensorTag.notifyAccelerometer(function() {

        // });
      },
      function(callback) {
        console.log('disableAccelerometer');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when disabling accerlero!');
		  sensorTag.disableAccelerometer(callback);
		});
        sensorTag.disableAccelerometer(callback);
      },
      function(callback) {
        console.log('enableHumidity');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when enabling humidity!');
		  sensorTag.enableHumidity(callback);
		});
        sensorTag.enableHumidity(callback);
      },
      function(callback) {
        console.log('readHumidity');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading humidity!');
		  readHum(callback);
		});
		var readHum = function(cb){
		  sensorTag.readHumidity(function(temperature, humidity) {
            console.log('\ttemperature = %d °C', temperature.toFixed(1));
            console.log('\thumidity = %d %', humidity.toFixed(1));
            cb();
          });
		};
		readHum(callback);

        // sensorTag.on('humidityChange', function(temperature, humidity) {
        //   console.log('\ttemperature = %d °C', temperature.toFixed(1));
        //   console.log('\thumidity = %d %', humidity.toFixed(1));
        // });

        // sensorTag.notifyHumidity(function() {

        // });
      },
      function(callback) {
        console.log('disableHumidity');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when disabling humidity!');
		  sensorTag.disableHumidity(callback);
		});
        sensorTag.disableHumidity(callback);
      },
      function(callback) {
        console.log('enableMagnetometer');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when enabling magneto!');
		  sensorTag.enableMagnetometer(callback);
		});
        sensorTag.enableMagnetometer(callback);
      },
      function(callback) {
        sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected!');
		  setTimeout(callback, 2000);
		});
        setTimeout(callback, 2000);
      },
      function(callback) {
        console.log('readMagnetometer');
		var readMag = function(cb){
          sensorTag.readMagnetometer(function(x, y, z) {
            console.log('\tx = %d μT', x.toFixed(1));
            console.log('\ty = %d μT', y.toFixed(1));
            console.log('\tz = %d μT', z.toFixed(1));
            cb();
		  });
        };
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading magneto!');
		  readMag(callback);
		});
		readMag(callback);
		
        // sensorTag.on('magnetometerChange', function(x, y, z) {
        //   console.log('\tx = %d μT', x.toFixed(1));
        //   console.log('\ty = %d μT', y.toFixed(1));
        //   console.log('\tz = %d μT', z.toFixed(1));
        // });

        // sensorTag.notifyMagnetometer(function() {

        // });
      },
      function(callback) {
        console.log('disableMagnetometer');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when disabling magneto!');
		  sensorTag.disableMagnetometer(callback);
		});
        sensorTag.disableMagnetometer(callback);
      },
      function(callback) {
        console.log('enableBarometricPressure');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {cb
		  console.log('successfully reconnected when disabling baro pressure!');
		  sensorTag.enableBarometricPressure(callback);
		});
        sensorTag.enableBarometricPressure(callback);
      },
      function(callback) {
        sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected!');
		  setTimeout(callback, 1000);
		});
        setTimeout(callback, 1000);
      },
      function(callback) {
        console.log('readBarometricPressure');
		var readPress = function(cb){
          sensorTag.readBarometricPressure(function(pressure) {
            console.log('\tpressure = %d mBar', pressure.toFixed(1));
            cb();
		  });
		};
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading barometric pressure!');
		  readPress(callback);
		});
		readPress(callback);
        // sensorTag.on('barometricPressureChange', function(pressure) {
        //   console.log('\tpressure = %d mBar', pressure.toFixed(1));
        // });

        // sensorTag.notifyBarometricPressure(function() {

        // });
      },
      function(callback) {
        console.log('disableBarometricPressure');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when disabling barometric pressure!');
		  sensorTag.disableBarometricPressure(callback);
		});
        sensorTag.disableBarometricPressure(callback);
      },
      function(callback) {
        console.log('enableGyroscope');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when enabling gyro!');
		  sensorTag.enableGyroscope(callback);
		});
        sensorTag.enableGyroscope(callback);
      },
      function(callback) {
        sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected!');
		  setTimeout(callback, 1000);
		});
        setTimeout(callback, 1000);
      },
      function(callback) {
        console.log('readGyroscope');
		var readGyro = function(cb){
          sensorTag.readGyroscope(function(x, y, z) {
            console.log('\tx = %d °/s', x.toFixed(1));
            console.log('\ty = %d °/s', y.toFixed(1));
            console.log('\tz = %d °/s', z.toFixed(1));
			cb();
          });
		};
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when reading gyro!');
		  readGyro(callback);
		});
		readGyro(callback);

        // sensorTag.on('gyroscopeChange', function(x, y, z) {
        //   console.log('\tx = %d °/s', x.toFixed(1));
        //   console.log('\ty = %d °/s', y.toFixed(1));
        //   console.log('\tz = %d °/s', z.toFixed(1));
        // });

        // sensorTag.notifyGyroscope(function() {

        // });
      },
      function(callback) {
        console.log('disableGyroscope');
		sensorTag.removeAllListeners('reconnect');
	    sensorTag.on('reconnect', function() {
		  console.log('successfully reconnected when disabling gyro!');
		  sensorTag.disableGyroscope(callback);
		});
        sensorTag.disableGyroscope(callback);
      },
      function(callback) {
        console.log('readBatteryLevel');
        sensorTag.readBatteryLevel(function(error, level) {
          if(error){
          	console.log('battery level read test failed - ' + error);
          }
          else{
            console.log('\tbatteryLevel = %d %', level);
          }
          callback();
        });

        // sensorTag.on('batteryLevelChange', function(level) {
        //     console.log('\tbatteryLevel = %d %', level);
        // });

        // sensorTag.notifyBatteryLevel(function() {

        // });
      },
      function(callback) {
        console.log('readSimpleRead');
        sensorTag.on('simpleKeyChange', function(left, right) {
          console.log('left: ' + left);
          console.log('right: ' + right);

          if (left && right) {
            sensorTag.notifySimpleKey(callback);
          }
        });

        sensorTag.notifySimpleKey(function() {

        });
      },
      function(callback) {
        console.log('disconnect');
        sensorTag.disconnect(callback);
      }
    ]
  );
});
