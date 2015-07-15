'use strict';
var async = require('async');
var SensorTag = require('sensortag');

// SensorTag UUIDs
var SensorTags = ['c4be84727309',
  'c4be8471a68d'];

// Timeout Variables
// Discovering is limited to timeoutVar
var timeoutVar = 60000;
var timeoutID;
var timeoutCleared = true;

// Duplicates allowed -> Reconnect possible
SensorTag.SCAN_DUPLICATES = true;

// For each discovered Tag
function onDiscover(sensorTag) {
  if (SensorTags.indexOf(sensorTag.uuid) > -1) {
    console.log('SensorTag ' + sensorTag.uuid + ' found');
  } else {
    console.log('SensorTag ' + sensorTag.uuid + ' not in list');
    return;
  }
  console.log('discovered: ' + sensorTag.uuid + ', type = ' + sensorTag.type);
  stopTimed();

  sensorTag.on('disconnect', function () {
    console.log('Disconnected.');

    if (timeoutCleared) {
      scanTimed();
    }
  });

  sensorTag.connectAndSetup(function () {
    console.log('Connect and setup');
    sensorTag.readDeviceName(function (error, deviceName) {
      console.log('\tDevice Name = ' + deviceName);
      console.log('\tType = ' + sensorTag.type);
      console.log('\tUUID = ' + sensorTag.uuid);
    });
    scanTimed();
  });
}

// Start timed discovering
function scanTimed() {
  console.log('Start discovering');
  timeoutCleared = false;
  SensorTag.discoverAll(onDiscover);
  timeoutID = setTimeout(function () {
    stopTimed();
  }, timeoutVar);
}

//Stop timer and discovering
function stopTimed() {
  SensorTag.stopDiscoverAll(onDiscover);
  timeoutCleared = true;
  console.log('Stop discovering');
  clearTimeout(timeoutID);
}

// Start discovering


scanTimed();
