# node-sensortag

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sandeepmistry/node-sensortag?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


node.js lib for the TI SensorTag

## Install

```sh
npm install sensortag
```

## Usage

```javascript
var SensorTag = require('sensortag');
```

### Discover

```javascript
SensorTag.discover(callback(sensorTag)[, uuid]);
```

Optional SensorTag ```uuid``` to scan for, obtained from previous discover ```sensorTag.uuid```.
The ```uuid``` per SensorTag may not be the same across machines. 

### Connect

```javascript
sensorTag.connect(callback);
```

### Disconnect

```javascript
sensorTag.disconnect(callback);
```

### Discover Services and Characteristics

```javascript
sensorTag.discoverServicesAndCharacteristics(callback);
```

### Device Info

```javascript
sensorTag.readDeviceName(callback(deviceName)); // does not work on OS X 10.10

sensorTag.readSystemId(callback(systemId));

sensorTag.readSerialNumber(callback(serialNumber));

sensorTag.readFirmwareRevision(callback(firmwareRevision));

sensorTag.readHardwareRevision(callback(hardwareRevision));

sensorTag.readSoftwareRevision(callback(softwareRevision));

sensorTag.readManufacturerName(callback(manufacturerName));
```

### IR Temperature Sensor

#### Enable/disable

```javascript
sensorTag.enableIrTemperature(callback);

sensorTag.disableIrTemperature(callback);

sensorTag.setIrTemperaturePeriod(period, callback); // period min 300ms, default period is 1000 ms
```

#### Read

```javascript
sensorTag.readIrTemperature(callback(objectTemperature, ambientTemperature));
```

#### Notify/Unnotify

```javascript
sensorTag.notifyIrTemperature(callback);

sensorTag.unnotifyIrTemperature(callback);

sensorTag.on('irTemperatureChange', callback(objectTemperature, ambientTemperature));
```

### Accelerometer

#### Enable/disable/configure

```javascript
sensorTag.enableAccelerometer(callback);

sensorTag.disableAccelerometer(callback);

sensorTag.setAccelerometerPeriod(period, callback); // period 1 - 2550 ms, default period is 2000 ms
```

#### Read

```javascript
sensorTag.readAccelerometer(callback(x, y, z));
```

#### Notify/Unnotify

```javascript
sensorTag.notifyAccelerometer(callback);

sensorTag.unnotifyAccelerometer(callback);

sensorTag.on('accelerometerChange', callback(x, y, z));
```

### Humidity Sensor

#### Enable/disable

```javascript
sensorTag.enableHumidity(callback);

sensorTag.disableHumidity(callback);
```

#### Read

```javascript
sensorTag.readHumidity(callback(temperature, humidity));
```

#### Notify/Unnotify

```javascript
sensorTag.notifyHumidity(callback);

sensorTag.unnotifyHumidity(callback);

sensorTag.on('humidityChange', callback(temperature, humidity));
```

### Magnetometer

#### Enable/disable

```javascript
sensorTag.enableMagnetometer(callback);

sensorTag.disableMagnetometer(callback);

sensorTag.setMagnetometerPeriod(period, callback); // period 1 - 2550 ms, default period is 2000 ms
```

#### Read

```javascript
sensorTag.readMagnetometer(callback(x, y, z));
```

#### Notify/Unnotify

```javascript
sensorTag.notifyMagnetometer(callback);

sensorTag.unnotifyMagnetometer(callback);

sensorTag.on('magnetometerChange', callback(x, y, z));
```

### Barometric Pressure Sensor

#### Enable/disable

```javascript
sensorTag.enableBarometricPressure(callback);

sensorTag.disableBarometricPressure(callback);
```

#### Read

```javascript
sensorTag.readBarometricPressure(callback(pressure));
```

#### Notify/Unnotify

```javascript
sensorTag.notifyBarometricPressure(callback);

sensorTag.unnotifyBarometricPressure(callback);

sensorTag.on('barometricPressureChange', callback(pressure));
```

### Gyroscope

#### Enable/disable/configure

```javascript
sensorTag.enableGyroscope(callback);

sensorTag.disableGyroscope(callback);

sensorTag.setGyroscopePeriod(period, callback); // period 100 - 2550 ms, default period is 1000 ms
```

#### Read

```javascript
sensorTag.readGyroscope(callback(x, y, z));
```

#### Notify/Unnotify

```javascript
sensorTag.notifyGyroscope(callback);

sensorTag.unnotifyGyroscope(callback);

sensorTag.on('gyroscopeChange', callback(x, y, z));
```

### Simple Key

#### Notify/Unnotify

```javascript
sensorTag.notifySimpleKey(callback);

sensorTag.unnotifySimpleKey(callback);

sensorTag.on('simpleKeyChange', callback(left, right));
```
    
[![Analytics](https://ga-beacon.appspot.com/UA-56089547-1/sandeepmistry/node-sensortag?pixel)](https://github.com/igrigorik/ga-beacon)
