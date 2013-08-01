node-sensortag
==============

node.js lib for the TI SensorTag

Install
-------

npm install sensortag

Usage
-----

    var SensorTag = require('sensortag');

__Discover__

    SensorTag.discover(callback(sensorTag));

__Connect__

    sensorTag.connect(callback);

__Disconnect__

    sensorTag.disconnect(callback);

__Discover Services and Characteristics__

    sensorTag.discoverServicesAndCharacteristics(callback);

__Device Info__

    sensorTag.readDeviceName(callback(deviceName));

    sensorTag.readSystemId(callback(systemId));

    sensorTag.readSerialNumber(callback(serialNumber));

    sensorTag.readFirmwareRevision(callback(firmwareRevision));

    sensorTag.readHardwareRevision(callback(hardwareRevision));

    sensorTag.readSoftwareRevision(callback(softwareRevision));

    sensorTag.readManufacturerName(callback(manufacturerName));

__IR Temperature Sensor__

Enable/disable:

    sensorTag.enableIrTemperature(callback);

    sensorTag.disableIrTemperature(callback);

Read:

    sensorTag.readIrTemperature(callback(objectTemperature, ambientTemperature));

Notify/Unnotify:

    sensorTag.notifyIrTemperature(callback);

    sensorTag.unnotifyIrTemperature(callback);

    sensorTag.on('irTemperatureChange', callback(objectTemperature, ambientTemperature));

__Accelerometer__

Enable/disable:

    sensorTag.enableAccelerometer(callback);

    sensorTag.disableAccelerometer(callback);

Read:

    sensorTag.readAccelerometer(callback(x, y, z));

Notify/Unnotify:

    sensorTag.notifyAccelerometer(callback);

    sensorTag.unnotifyAccelerometer(callback);

    sensorTag.on('accelerometerChange', callback(x, y, z));

__Humidity Sensor__

Enable/disable:

    sensorTag.enableHumidity(callback);

    sensorTag.disableHumidity(callback);

Read:

    sensorTag.readHumidity(callback(temperature, humidity));

Notify/Unnotify:

    sensorTag.notifyHumidity(callback);

    sensorTag.unnotifyHumidity(callback);

    sensorTag.on('humidityChange', callback(temperature, humidity));

__Magnetometer__

Enable/disable:

    sensorTag.enableMagnetometer(callback);

    sensorTag.disableMagnetometer(callback);

Read:

    sensorTag.readMagnetometer(callback(x, y, z));

Notify/Unnotify:

    sensorTag.notifyMagnetometer(callback);

    sensorTag.unnotifyMagnetometer(callback);

    sensorTag.on('magnetometerChange', callback(x, y, z));

__Barometric Pressure Sensor__

Enable/disable:

    sensorTag.enableBarometricPressure(callback);

    sensorTag.disableBarometricPressure(callback);

Read:

    sensorTag.readBarometricPressure(callback(pressure));

Notify/Unnotify:

    sensorTag.notifyBarometricPressure(callback);

    sensorTag.unnotifyBarometricPressure(callback);

    sensorTag.on('barometricPressureChange', callback(pressure));

__Gyroscope__

Enable/disable:

    sensorTag.enableGyroscope(callback);

    sensorTag.disableGyroscope(callback);

Read:

    sensorTag.readGyroscope(callback(x, y, z));

Notify/Unnotify:

    sensorTag.notifyGyroscope(callback);

    sensorTag.unnotifyGyroscope(callback);

    sensorTag.on('gyroscopeChange', callback(x, y, z));

__Simple Key__

Notify/Unnotify:

    sensorTag.notifySimpleKey(callback);

    sensorTag.unnotifySimpleKey(callback);

    sensorTag.on('simpleKeyChange', callback(left, right));
