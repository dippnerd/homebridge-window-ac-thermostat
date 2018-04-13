/*
{
    "bridge": {
    	...
    },
    "description": "...",
    "accessories": [
        {
	        "accessory": "Window-AC-Thermostat",
	        "name": "AC",
	        "apiroute": "http://192.168.1.186"
        }
    ],
    "platforms":[]
}
*/



var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-window-ac-thermostat", "Window-AC-Thermostat", Thermostat);
};


function Thermostat(log, config) {
	this.log = log;
	// this.maxTemp = config.maxTemp || 30; //these aren't supported yet
	// this.minTemp = config.minTemp || 16; //these aren't supported yet
	this.name = config.name;
	this.apiroute = config.apiroute || "apiroute";
	this.log(this.name, this.apiroute);

	//Characteristic.TemperatureDisplayUnits.CELSIUS = 0;
	//Characteristic.TemperatureDisplayUnits.FAHRENHEIT = 1;
	this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
	this.currentTemperature = config.startTemp || 72;
	this.currentRelativeHumidity = 0.70;
	// The value property of CurrentHeatingCoolingState must be one of the following:
	//Characteristic.CurrentHeatingCoolingState.OFF = 0;
	//Characteristic.CurrentHeatingCoolingState.HEAT = 1;
	//Characteristic.CurrentHeatingCoolingState.COOL = 2;
	this.heatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
	this.targetTemperature = 72;
	this.targetRelativeHumidity = 0.5;
	//this.heatingThresholdTemperature = 25;
	//this.coolingThresholdTemperature = 5;
	// The value property of TargetHeatingCoolingState must be one of the following:
	//Characteristic.TargetHeatingCoolingState.OFF = 0;
	//Characteristic.TargetHeatingCoolingState.HEAT = 1;
	//Characteristic.TargetHeatingCoolingState.COOL = 2;
	//Characteristic.TargetHeatingCoolingState.AUTO = 3;
	this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;

	this.service = new Service.Thermostat(this.name);

}

function toC(fahrenheit) {
  return (fahrenheit - 32) / 1.8;
}

function toF(celsius) {
  return Math.round((celsius * 1.8) + 32);
}

Thermostat.prototype = {
	//Start
	identify: function(callback) {
		this.log("Identify requested!");
		callback(null);
	},
	// Required
	getCurrentHeatingCoolingState: function(callback) {
		this.log("getCurrentHeatingCoolingState from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute+"/status",
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body); //{targetHeatingCoolingState":3,"currentHeatingCoolingState":0,"targetTemperature":10,"temperature":12,"humidity":98}
				this.log("currentHeatingCoolingState is %s", json.State);
				this.currentHeatingCoolingState = json.State;
				this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, this.currentHeatingCoolingState);
				
				callback(null, this.currentHeatingCoolingState); // success
			} else {
				this.log("Error getting CurrentHeatingCoolingState: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTargetHeatingCoolingState: function(callback) {
		this.log("getTargetHeatingCoolingState from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute+"/status",
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log('response success');
				var json = JSON.parse(body);
				this.log("Target State is: %s", json.State);
				if (json.State == 0) {
					this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;
				}
				else if (json.State == 1) {
					this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.HEAT;
				}
				else if (json.State == 2) {
					this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.COOL;
				}
				return callback(null, this.TargetHeatingCoolingState); // success
			} else {
				this.log("Error getting TargetHeatingCoolingState: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	setTargetHeatingCoolingState: function(value, callback) {
		var tarState = 0;
		this.log('Setting Target State from/to :', this.TargetHeatingCoolingState, value);
		if (value == Characteristic.TargetHeatingCoolingState.OFF) {
			this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;
			tarState = 0;
		}
		else if (value == Characteristic.TargetHeatingCoolingState.HEAT) {
			this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.HEAT;
			tarState = 1;
		}
		else if (value == Characteristic.TargetHeatingCoolingState.COOL) {
			this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.COOL;
			tarState = 2;
		}
		else if (value == Characteristic.TargetHeatingCoolingState.AUTO) {
			this.TargetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.AUTO;
			tarState = 3;
		}
		else {
			this.log('Unsupported value', value);
			tarState = 0;
			return callback(value + " state unsupported");
		}
		this.log("'" + this.apiroute + '/state/' + tarState + "'");
		return request.get({
			url: this.apiroute + '/state/' + tarState
		}, (function(err, response, body) {
			if (!err && response.statusCode === 200) {
				this.log('response succes');
				return callback(null);
			} else {
				this.log('Error setting Target State: %s', err);
				this.log('Response code: %s', response.statusCode)
				return callback("Error setting mode: " + err);
			}
		}).bind(this));
	},
	getCurrentTemperature: function(callback) {
		this.log("getCurrentTemperature from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute+"/status",
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body); //{targetHeatingCoolingState":3,"currentHeatingCoolingState":0,"temperature":"18.10","humidity":"34.10"}

				if (json.currentTemperature != undefined)
                {
                  this.log("CurrentTemperature %s", toC(json.Temperature));
                  this.currentTemperature = toC(parseFloat(json.Temperature));
                }
                else
                {
                  this.log("Temperature %s", toC(json.Temperature));
                  this.currentTemperature = toC(parseFloat(json.Temperature));
                }
								
				callback(null, this.currentTemperature); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTargetTemperature: function(callback) {
		this.log("getTargetTemperature from:", this.apiroute+"/status");
		request.get({
			url: this.apiroute+"/status",
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				var json = JSON.parse(body); //{targetHeatingCoolingState":3,"currentHeatingCoolingState":0"temperature":"18.10","humidity":"34.10"}
				this.targetTemperature = toC(parseFloat(json.Temperature));
				this.log("Target temperature is %s", toC(this.Temperature));
				callback(null, this.targetTemperature); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	setTargetTemperature: function(value, callback) {
		this.log("setTargetTemperature from:", this.apiroute+"/temp/"+toF(value));
		request.get({
			url: this.apiroute+"/temp/"+toF(value),
			auth : this.auth
		}, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				this.log("response success");
				callback(null); // success
			} else {
				this.log("Error getting state: %s", err);
				callback(err);
			}
		}.bind(this));
	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		var error = null;
		callback(error, this.temperatureDisplayUnits);
	},
	setTemperatureDisplayUnits: function(value, callback) {
		this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = value;
		var error = null;
		callback(error);
	},
	getName: function(callback) {
		this.log("getName :", this.name);
		var error = null;
		callback(error, this.name);
	},

	getServices: function() {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "HTTP Manufacturer")
			.setCharacteristic(Characteristic.Model, "HTTP Model")
			.setCharacteristic(Characteristic.SerialNumber, "HTTP Serial Number");
		

		// Required Characteristics
		this.service
			.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
			.on('get', this.getCurrentHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetHeatingCoolingState)
			.on('get', this.getTargetHeatingCoolingState.bind(this))
			.on('set', this.setTargetHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', this.getCurrentTemperature.bind(this))
			.setProps({
				maxValue: 30,
				minValue: 16,
				minStep: 1
			});

		this.service
			.getCharacteristic(Characteristic.TargetTemperature)
			.on('get', this.getTargetTemperature.bind(this))
			.on('set', this.setTargetTemperature.bind(this))
			.setProps({
				maxValue: 30,
				minValue: 16,
				minStep: 1
			});

		this.service
			.getCharacteristic(Characteristic.TemperatureDisplayUnits)
			.on('get', this.getTemperatureDisplayUnits.bind(this))
			.on('set', this.setTemperatureDisplayUnits.bind(this));

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

		return [informationService, this.service];
	}
};