# Version 1.3.0

 * Add support to CC2650 battery service ([@micahnyc](https://github.com/micahnyc))

# Version 1.2.3

 * CC2650 now also treats advertised service UUID ```aa80``` as device ([@julianoAffonso](https://github.com/julianoAffonso))
 * use noble-device ^1.4.1

# Version 1.2.2

 * revert "only set specific MPU9250 sensor bits with enabling/disabling"

# Version 1.2.1

 * only set specific MPU9250 sensor bits with enabling/disabling
 * use 8G accelerometer mode and conversion formula (#62)
 * update MPU9250 formulas to match TI Android source code

# Version 1.2.0

 * new CC2650 IO API's: ``readIoData``, ``writeIoData``, ``readIoConfig``, and ``writeIoConfig``
 * add ``reedRelay`` arg to ``simpleKeyChange`` event for CC2650

# Version 1.1.1

 * add missing ```discoverById``` API

## Version 1.1

 * use noble-device ^1.1.0
 * use id instead of uuid
 * new ```discoverByAddress``` and ```discoverById``` API's - ```discoverByUuid``` is deprecated now

## Version 1.0.2

 * Correct code for reading barometric pressure with firmware 0.89 or older ([@bChiquet](https://github.com/bChiquet))

## Version 1.0.1

 * barometric sensor reading and luxometer conversion formula corrections ([@martin-doyle](https://github.com/martin-doyle))

## Version 1.0

 * use noble-device instead of noble directly
 * add error parameters to callbacks
 * support for SensorTag 2.0 / CC2650
 * remove ```enableGyroscopeAxis``` API
 * new ```discoverAll```, ```stopDiscoverAll```, and ```discoverByUuid``` API's

## Older

 * Changes not recorded

