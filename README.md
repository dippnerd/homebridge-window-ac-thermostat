# homebridge-window-ac-thermostat

Homebridge plugin to control window air conditioners that use the Arduino/NodeMCU/ESP8622-based hardware and API found here: [Window-AC-Web-API](https://github.com/dippnerd/Window-AC-Web-API)

It will create a thermostat for each window AC unit that is added, giving you controls for "Off", "Auto" (which maps to "Eco/Auto Cool", and "Cool" (which maps to the standard "Cool" setting) as well as temperature control. 

The intention of this is that you can turn your "dumb" infrared(IR)-controlled window AC units into HomeKit supported devices. Because it is a thermostat, you can do things like tell Siri "set the bedroom to 72 degrees" or "set the bedroom to cool". 

**NOTE:** This plugin alone will not control your AC, you will need to build/configure the hardware for the [Window-AC-Web-API](https://github.com/dippnerd/Window-AC-Web-API) first. 

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-window-ac-thermostat
3. Update your configuration file as noted below

# Configuration

Configuration sample:

 ```
    {
        "bridge": {
            ...
        },
        
        "description": "...",

        "accessories": [
            {
                "accessory": "Window-AC-Thermostat",
                "name": "Bedroom AC",
                "apiroute": "http://myurl.com"
            }
        ],

        "platforms":[]
    }
```

# Home App

If everything worked, you should see a new Thermostat icon in the Home app:

![alt text](https://github.com/dippnerd/homebridge-window-ac-thermostat/raw/master/img/home-app.png "HomeKit Thermostat")

If you open that up, we should have a Temperature slider:

![alt text](https://github.com/dippnerd/homebridge-window-ac-thermostat/raw/master/img/temperature.png "Temperature slider")

And tapping "Mode" at the bottom left should give us options to toggle the AC mode:

![alt text](https://github.com/dippnerd/homebridge-window-ac-thermostat/raw/master/img/mode.png "Mode options")

Using the Home app, you can now remotely control your AC or use Siri for things like "set living room to 'cool'" or "set bedroom to 72 degrees". You can also create automations such as "when no one is home, turn off all ACs" or "30 minutes before bed time, start cooling the bedroom." 

# Notes

This was built to interface with the [Window-AC-Web-API](https://github.com/dippnerd/Window-AC-Web-API) using a NodeMCU v1.0. It can be easily modified to work with Arduino or other similar devices, refer to that project for more details. 

The config doesn't properly support minTemp and maxTemp yet, but do note these values must be in celsius if you are modifying the code directly. Max is currently set to 30C and Min is set to 16C. These settings must be set in the "getServices" area, towards the bottom, to work properly. 
