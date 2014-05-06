var util = require('util');
var debug = require('debug')('test_gyro');
var async = require('async');

var SensorTag = require('./index');

SensorTag.discover(function(sensorTag) {

  sensorTag.on('disconnect', function() {
    debug('disconnected!');
    process.exit(0);
  });
  
  sensorTag.on('connectionDrop', function() {
    debug('connection drop!');
  });
  
  sensorTag.on('reconnect', function() {
    debug('successfully reconnected!');
  });


  async.series([
      function(callback) {
        debug('connect');
        sensorTag.connect(callback);
      },
      function(callback) {
        debug('discoverServicesAndCharacteristics');
        sensorTag.discoverServicesAndCharacteristics(callback);
      },
      function(callback) {
        debug('readDeviceName');
        sensorTag.readDeviceName(function(deviceName) {
          debug('\tdevice name = ' + deviceName);
          callback();
        });
      },
      function(callback) {
        debug('readSystemId');
        sensorTag.readSystemId(function(systemId) {
          debug('\tsystem id = ' + systemId);
          callback();
        });
      },
      function(callback) {
        debug('readSerialNumber');
        sensorTag.readSerialNumber(function(serialNumber) {
          debug('\tserial number = ' + serialNumber);
          callback();
        });
      },
      function(callback) {
        debug('readFirmwareRevision');
        sensorTag.readFirmwareRevision(function(firmwareRevision) {
          debug('\tfirmware revision = ' + firmwareRevision);
          callback();
        });
      },
      function(callback) {
        debug('readHardwareRevision');
        sensorTag.readHardwareRevision(function(hardwareRevision) {
          debug('\thardware revision = ' + hardwareRevision);
          callback();
        });
      },
      function(callback) {
        debug('readSoftwareRevision');
        sensorTag.readHardwareRevision(function(softwareRevision) {
          debug('\tsoftware revision = ' + softwareRevision);
          callback();
        });
      },
      function(callback) {
        debug('readManufacturerName');
        sensorTag.readManufacturerName(function(manufacturerName) {
          debug('\tmanufacturer name = ' + manufacturerName);
          callback();
        });
      },

      function(callback) {
        debug('enableGyroscope');
        sensorTag.enableGyroscope(function(){
          //100 is min value corresponding to 10ms
          sensorTag.setGyroscopePeriod(100, function(){
            callback();
          });
        });
      },
      function(callback) {
        setTimeout(callback, 1000);
      },
      function(callback) {
         sensorTag.on('gyroscopeChange', function(x, y, z) {
           debug('\tx = %d °/s - y = %d °/s - z = %d °/s', x.toFixed(1), y.toFixed(1), z.toFixed(1));
         });
         sensorTag.notifyGyroscope(function() {
           callback()
         });
      },
      function(callback) {      
        setTimeout(callback, 1000);
      },
      function(callback) {
        sensorTag.disableGyroscope(function(){
          debug('Gyroscope disabled');
          setTimeout(callback, 1000);
        });
      },
      function(callback) {      
         sensorTag.unnotifyGyroscope(function() {
           callback()
         });
      },
      function(callback) {      
         sensorTag.notifyGyroscope(function() {
           callback()
         });
      },      
      function(callback) {      
        debug('enableGyroscope');
        sensorTag.enableGyroscope(function(){
          //1000 is min value corresponding to 100ms
          sensorTag.setGyroscopePeriod(1000, function(){
          callback();
          });
        });
      },
      function(callback) {      
        setTimeout(callback, 1000);
      },      
      function(callback) {
        sensorTag.disableGyroscope(function(){
          debug('Gyroscope disabled');
          callback();
        });
      },      
    ]
  );
});
