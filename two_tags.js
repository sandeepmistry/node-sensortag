var util = require('util');
var async = require('async');
var SensorTag = require('./index');

var address1 = "BLE_MAC_ADDRESS1"; // BLE MAC, e.g. 'a1e6f9af4c76'
var address2 = "BLE_MAC_ADDRESS2";

var tags = [];
var tags_status = [];

SensorTag.discoverByUuid(address1, function(tag){
	console.log("found " + tag.uuid);
    tags.push(tag);
    tags_status.push(false);
});

SensorTag.discoverByUuid(address2, function(tag){
    console.log("found " + tag.uuid);
    tags.push(tag);
    tags_status.push(false);

});

setTimeout(function(){
	console.log("Trying to connect to sensors %s", tags);
	
	tags.forEach(function(tag, i) {
		tag.on('disconnect', function(callback) {
			console.log('disconnected!');
			process.exit(0);
		});
		tag.connectAndSetUp(function(callback) {
			console.log("connected " + tag);
			tags_status[i] = true;
			
			async.series([ 
			
			    // Send audio notifications in order to enable audio transmission
				function(callback) {
					console.log('TAG:#%s\tnotifyAudioConfig',tag.uuid);
					tag.notifyAudioConfig(callback);
                },
                function(callback) {
					setTimeout(callback, 2000);
                },
				
                function(callback) {
					console.log('TAG:#%s\tnotifyAudioStream',tag.uuid);
					tag.notifyAudioStream(callback);
                },
                function(callback) {
					setTimeout(callback, 2000);
                },
				
				// Fetch audio
				function(callback) {
					console.log('readAudio');
					tag.on('AudioChange', function(audio) {
					  if(!audio) {
					    callback();
					  }					 
					});
				},
				
				// Send audio de-notifications in order to disable audio transmission
				function(callback) {
				  console.log('TAG:#%s\tunnotifyAudioStream',tag.uuid);
				  tag.unnotifyAudioStream(callback);
				},
				
				function(callback) {
				  setTimeout(callback, 2000);
				},
	  
				function(callback) {
				  console.log('TAG:#%s\tunnotifyAudioConfig',tag.uuid);
				  tag.unnotifyAudioConfig(callback);
				},
				
				function(callback) {
				  setTimeout(callback, 2000);
				},
				
				// Disconnect
				function(callback) {
					console.log('disconnect', tag.uuid);
					tag.disconnect(callback);
				}
				
			]);
		});
	});
	
},4000);