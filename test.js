var util = require('util');

var async = require('async');

var SensorTag = require('./index');

SensorTag.discover(function(sensorTag) {

  sensorTag.on('disconnect', function() {
    console.log('disconnected!');
    process.exit(0);
  });

  async.series([
      function(callback) {
        console.log('connect');
        sensorTag.connect(callback);
      },
      function(callback) {
        console.log('discoverServicesAndCharacteristics');
        sensorTag.discoverServicesAndCharacteristics(callback);
      },
      function(callback) {
        console.log('readDeviceName');
        sensorTag.readDeviceName(function(deviceName) {
          console.log('\tdevice name = ' + deviceName);
          callback();
        });
      },
      function(callback) {
        console.log('readSystemId');
        sensorTag.readSystemId(function(systemId) {
          console.log('\tsystem id = ' + systemId);
          callback();
        });
      },
      function(callback) {
        console.log('readSerialNumber');
        sensorTag.readSerialNumber(function(serialNumber) {
          console.log('\tserial number = ' + serialNumber);
          callback();
        });
      },
      function(callback) {
        console.log('readFirmwareRevision');
        sensorTag.readFirmwareRevision(function(firmwareRevision) {
          console.log('\tfirmware revision = ' + firmwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readHardwareRevision');
        sensorTag.readHardwareRevision(function(hardwareRevision) {
          console.log('\thardware revision = ' + hardwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readSoftwareRevision');
        sensorTag.readHardwareRevision(function(softwareRevision) {
          console.log('\tsoftware revision = ' + softwareRevision);
          callback();
        });
      },
      function(callback) {
        console.log('readManufacturerName');
        sensorTag.readManufacturerName(function(manufacturerName) {
          console.log('\tmanufacturer name = ' + manufacturerName);
          callback();
        });
      },
      function(callback) {
        console.log('enableIrTemperature');
        sensorTag.enableIrTemperature(callback);
      },
      function(callback) {
        setTimeout(callback, 2000);
      },
      function(callback) {
        console.log('readIrTemperature');
        sensorTag.readIrTemperature(function(objectTemperature, ambientTemperature) {
          console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
          console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));

          callback();
        });

        // sensorTag.on('irTemperatureChange', function(objectTemperature, ambientTemperature) {
        //   console.log('\tobejct temperature = %d °C', objectTemperature.toFixed(1));
        //   console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1))
        // });

        // sensorTag.notifyIrTemperature(function() {

        // });
      },
      function(callback) {
        console.log('disableAccelerometer');
        sensorTag.disableAccelerometer(callback);
      },
      function(callback) {
        console.log('enableAccelerometer');
        sensorTag.enableAccelerometer(callback);
      },
      function(callback) {
        setTimeout(callback, 2000);
      },
      function(callback) {
        console.log('readAccelerometer');
        sensorTag.readAccelerometer(function(x, y, z) {
          console.log('\tx = %d G', x.toFixed(1));
          console.log('\ty = %d G', y.toFixed(1));
          console.log('\tz = %d G', z.toFixed(1));

          callback();
        });

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
        sensorTag.disableAccelerometer(callback);
      },
      function(callback) {
        console.log('enableHumidity');
        sensorTag.enableHumidity(callback);
      },
      function(callback) {
        console.log('readHumidity');
        sensorTag.readHumidity(function(temperature, humidity) {
          console.log('\ttemperature = %d °C', temperature.toFixed(1));
          console.log('\thumidity = %d %', humidity.toFixed(1));

          callback();
        });

        // sensorTag.on('humidityChange', function(temperature, humidity) {
        //   console.log('\ttemperature = %d °C', temperature.toFixed(1));
        //   console.log('\thumidity = %d %', humidity.toFixed(1));
        // });

        // sensorTag.notifyHumidity(function() {

        // });
      },
      function(callback) {
        console.log('disableHumidity');
        sensorTag.disableHumidity(callback);
      },
      function(callback) {
        console.log('enableMagnetometer');
        sensorTag.enableMagnetometer(callback);
      },
      function(callback) {
        setTimeout(callback, 2000);
      },
      function(callback) {
        console.log('readMagnetometer');
        sensorTag.readMagnetometer(function(x, y, z) {
          console.log('\tx = %d μT', x.toFixed(1));
          console.log('\ty = %d μT', y.toFixed(1));
          console.log('\tz = %d μT', z.toFixed(1));

          callback();
        });

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
        sensorTag.disableMagnetometer(callback);
      },
      function(callback) {
        console.log('enableBarometricPressure');
        sensorTag.enableBarometricPressure(callback);
      },
      function(callback) {
        setTimeout(callback, 1000);
      },
      function(callback) {
        console.log('readBarometricPressure');
        sensorTag.readBarometricPressure(function(pressure) {
          console.log('\tpressure = %d mBar', pressure.toFixed(1));

          callback();
        });

        // sensorTag.on('barometricPressureChange', function(pressure) {
        //   console.log('\tpressure = %d mBar', pressure.toFixed(1));
        // });

        // sensorTag.notifyBarometricPressure(function() {

        // });
      },
      function(callback) {
        console.log('disableBarometricPressure');
        sensorTag.disableBarometricPressure(callback);
      },
      function(callback) {
        console.log('enableGyroscope');
        sensorTag.enableGyroscope(callback);
      },
      function(callback) {
        setTimeout(callback, 1000);
      },
      function(callback) {
        console.log('readGyroscope');
        sensorTag.readGyroscope(function(x, y, z) {
          console.log('\tx = %d °/s', x.toFixed(1));
          console.log('\ty = %d °/s', y.toFixed(1));
          console.log('\tz = %d °/s', z.toFixed(1));

          callback();
        });

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
        sensorTag.disableGyroscope(callback);
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
