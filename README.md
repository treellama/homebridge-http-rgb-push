[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Build Status](https://travis-ci.com/QuickSander/homebridge-http-rgb-push.svg?branch=master)](https://travis-ci.com/QuickSander/homebridge-http-rgb-push)
[![npm version](https://badge.fury.io/js/homebridge-http-rgb-push.svg)](https://badge.fury.io/js/homebridge-http-rgb-push)

# homebridge-http-rgb-push

_Homebridge plugin to control a HTTP-based RGB device._

Supports RGB HTTP(S) devices on the HomeBridge Platform and provides a readable
callback for getting and setting the following characteristics to Homekit:

* Characteristic.On
* Characteristic.Brightness
* Characteristic.Hue
* Characteristic.Saturation

## What is this fork?

This fork differs from the original [jnovack/homebridge-better-http-rgb](https://github.com/jnovack/homebridge-better-http-rgb#why-better) in the following ways:
* Supports [homebridge-http-notifiation-server](https://github.com/Supereg/homebridge-http-notification-server) to allow the device to push it's status changes instead of poll based pull. E.g. if you have one device that
  allows for multiple different effects while only one can be active at the same time. HomeKit can then show multiple switches representing one device. The group of switches will function as a radio button since the device will push the off status for the other switches. Or when you manually reboot the device to notify HomeKit of its
  updated state after reboot.
* Supports regular expression pattern matching for on/off switches to determine whether the body reflects an on or off status.
* Fixes a bug which causes the original plugin to not report the correct manufacturer, make and model towards HomeKit.
* Briefly turn off/on or on/off the light/switch to locate the device's physical
location when HomeKit requests 'identify'.
* Added timeout parameter to prevent HomeBridge from getting stuck on a single unresponsive device. Credits: [Tommrodrigues/homebridge-better-http-rgb](https://github.com/Tommrodrigues/homebridge-better-http-rgb).
* Added error handling for non HTTP 200 status code replies.
* README rewrite and corrections.

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install homebridge-http-rgb-push using: `sudo npm install -g homebridge-http-rgb-push`
3. Update your configuration file.  See below for examples.

Note: See [Installing packages globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally) when you experience
permission problems.

## Uninstall

To uninstall homebridge-better-http-rgb, simply run:
```
sudo npm uninstall -g homebridge-http-rgb-push
```

# Configuration

## Examples

### Full RGB Device

```json
 "accessories": [
     {
         "accessory": "HttpPushRgb",
         "name": "RGB Led Strip",
         "service": "Light",
         "timeout": 3000,

         "switch": {
             "status": "http://localhost/api/v1/status",
             "powerOn": "http://localhost/api/v1/on",
             "powerOff": "http://localhost/api/v1/off"
         },

         "brightness": {
             "status": "http://localhost/api/v1/brightness",
             "url": "http://localhost/api/v1/brightness/%s"
         },

         "color": {
             "status": "http://localhost/api/v1/set",
             "url": "http://localhost/api/v1/set/%s",
             "brightness": true
         }
     }
 ]
 ```

### Single Color Light that only turns "off" and "on"

```json
 "accessories": [
     {
         "accessory": "HttpPushRgb",
         "name": "Single Color Light",
         "service": "Light",

         "switch": {
             "status": "http://localhost/api/v1/status",
             "powerOn": "http://localhost/api/v1/on",
             "powerOff": "http://localhost/api/v1/off"
         }
     }
 ]
 ```

### Single Color Light with Brightness
```json
 "accessories": [
     {
         "accessory": "HttpPushRgb",
         "name": "Single Color Light",
         "service": "Light",

         "switch": {
             "status": "http://localhost/api/v1/status",
             "powerOn": "http://localhost/api/v1/on",
             "powerOff": "http://localhost/api/v1/off"
         },

         "brightness": {
             "status": "http://localhost/api/v1/brightness",
             "url": "http://localhost/api/v1/brightness/%s"
         }
     }
 ]
 ```

### RGB Light without Brightness

```json
 "accessories": [
     {
         "accessory": "HttpPushRgb",
         "name": "Single Color Light",
         "service": "Light",

         "switch": {
             "status": "http://localhost/api/v1/status",
             "powerOn": "http://localhost/api/v1/on",
             "powerOff": "http://localhost/api/v1/off"
         },

         "color": {
             "status": "http://localhost/api/v1/set",
             "url": "http://localhost/api/v1/set/%s"
         }
     }
 ]
 ```

This normally will not occur, however, you may not want your application to
display a "brightness" slider to the user.  In this case, you will want to
remove the brightness component from the config.

### Regular expression on-body matching

    "accessories": [
        {
            "accessory": "HttpPushRgb",
            "name": "JSON body matching",
            "service": "Light",

            "switch": {
                "status": {
                    "url": "http://localhost/api/v1/status",
                    "bodyRegEx": "\"switch\":\s*\"on\""
                }
                "powerOn": "http://localhost/api/v1/on",
                "powerOff": "http://localhost/api/v1/off"
            }
            }
        }
    ]

## Structure

| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be "HttpPushRgb" | |
| `name` | The name of your RGB accessory. It will appear in the Home app | "RGB Light" |
| `service` | `"Light"` or `"Switch"` |  |
| `timeout` _(optional)_ | Time (in milli seconds) until the accessory will be marked as "Not Responding" if it is unreachable.| 10000 |
| `http_method` _(optional)_ | The HTTP method used for set requests only. Get HTTP requests are fixed to 'GET' for now. | "GET" |
| `username` _(optional)_ | Username if http authentication is enabled on the RGB device. | |
| `password` _(optional)_ | Password if http authentication is enabled on the RGB device. | |
| `notificationID` _(optional)_ | Identifier to use when device sends push notifications. See [Push notifications](#push-responses-device-pushes-updates)  | |
| `notificationPasword` _(optional)_ | Password to use when device sends push notifications.  | |
| `switch` | A [switch object](#switch-object) | - |
| `brightness` | A [brightness object](#brightness-object) | - |
| `color` | A [color object](#color-object) | - |

### Switch object

| Key | Description |
| --- | --- |
| `status` | URL to get RGB current state (`1` or `0`) or a [status object](#switch-status-object). |
| `powerOn` | URL to set the on state of the RGB device |
| `powerOff` | URL to set the off state of the RGB device |

#### Switch status object
| Key | Description |
| --- | --- |
| `url` | URL to retrieve switch status |
| `bodyRegEx` | Regular expression. When matched switch is considered "on". |

### Brightness object

| Key | Description |
| --- | --- |
| `status` | URL to get RGB current brightness (`0`-`100`(%)) |
| `url` | URL to set the current brightness of the RGB device (`0`-`100`(%)) |
| `http_method` _(optional)_ | The brightness specific HTTP method for set requests. If omitted defaults to `http_method` as specified in the root structure |

### Color object
| Key | Description |
| --- | --- |
| `status` | URL to get RGB current colour (HEX value) |
| `url` | URL to set the RGB colour value (HEX value) |
| `brightness` | Whether or not the plugin should include brightness data in `color` HEX data (`true` or `false`). When `true` brightness will be controllable in HomeKit but will be changed through changing RGB values. |
| `http_method` _(optional)_ | The brightness specific HTTP method for set requests. If omitted defaults to `http_method` as specified in the root structure |


# Device responses
## Pull method: HomeBridge polls
All `.status` urls expect a 200 HTTP status code.

`switch.status` Can be configured to parse the body to determine the switch
status. When the specified `switch.status.bodyRegEx` matches the body the
switch is considered to be in the on status. If this parameter is left out
`switch.status` expects `0` for Off, and `1` for On.

All other `.status` urls expect a body of a single
string with no HTML markup.

* `brightness.status` expects a number from 0 to 100.
* `color.status` expects a 6-digit hexidemial number.

## Push responses: Device pushes updates
This accessory supports push notification from the physical device via
[homebridge-http-notification-server](https://github.com/Supereg/homebridge-http-notification-server). This allows the device to modify the
switch's status by pushing the new status instead of Homebridge pulling it.
This can be realized by supplying the `notificationID` as part of this accesory's configuration.
Your device should then push the `On` `characteristic` towards the notification server.
E.g. a POST request towards `http://<homebridge-host>:<notification-server-port>/<notificationID>` with the following
body:

```json
{
   "characteristic": "On",
   "value": true
}
```

To get more details about the push configuration have a look at the notification server's
[README](https://github.com/Supereg/homebridge-http-notification-server).
