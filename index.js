#! /usr/bin/env node
var Firebase = require("firebase");
var fs = require('fs');
var exec = require('child_process').exec;
var myFirebaseRef = new Firebase("https://morpha-monitor.firebaseio.com/");

var run = true;

var currentSensorData = {};

function init(){
	loop();
	console.log('Server Monitor Starting. Sending Data to Firebase Instance.');
}

function loop(){
	var child = exec('sensors',
  function (error, stdout, stderr) {
    splitSensorData(stdout);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
if(run){
	setTimeout(function(){
        	loop();
	}, 1000);
}

}

function splitSensorData(sensorData){
	var split = sensorData.split(/\r?\n/);
	parseSensorData(split);
}

function parseSensorData(sensorDataArray){
	findProcessorData(sensorDataArray);
	myFirebaseRef.set(currentSensorData);
}

function findProcessorData(sensorDataArray){
	for(var i = 0; i < sensorDataArray.length; i++){
		if(sensorDataArray[i].indexOf('coretemp-isa-0000') > -1){
			currentSensorData.cpu1 = {
				core0: getTemp(sensorDataArray[i+2]),
				core1: getTemp(sensorDataArray[i+3]),
				core2: getTemp(sensorDataArray[i+4]),
				core3: getTemp(sensorDataArray[i+5]),
				avgCoreTemp: (getTemp(sensorDataArray[i+2]) + getTemp(sensorDataArray[i+3]) + getTemp(sensorDataArray[i+4]) + getTemp(sensorDataArray[i+5]))/4
			}	
		}
	}
}

function getTemp(coreTempString){
	var arr = coreTempString.split('');
	var temp = "";
	for(var i = 0; i < arr.length; i ++){
		if(arr[i] === "+"){
			temp += arr[i+1];
			 temp += arr[i+2];
			 temp += arr[i+3];
			 temp += arr[i+4];
			break;	
		}	
	}
	var tempDigit = parseFloat(temp);
	if(tempDigit){
		tempDigit  = (tempDigit * 1.8) + 32;
		
	}
	return tempDigit;
}

init();

