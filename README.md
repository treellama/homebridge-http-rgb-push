[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Lint, Test and Release](https://github.com/QuickSander/homebridge-http-rgb-push/actions/workflows/release.yml/badge.svg)](https://github.com/QuickSander/homebridge-http-rgb-push/actions/workflows/release.yml)
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
* Allow GET requests with body matching for colour and status. Credits: [Michael Mezger](https://github.com/mimez)

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

### Full RGB Device with advanced SET / GET Handling

Following configuration is a real world example for a accessory that combines a shelly switch / relay with a hue light bulb. ON/OFF-Signals will be sent to the shelly switch. On the other hand, changes to brightness / color are going to the hue bulb.

```json
"accessories": [
    {
        "accessory": "HttpPushRgb",
        "name": "Full RGB Device with advanced SET / GET Handling",
        "service": "Light",
        "timeout": 3000,
        "switch": {
            "notificationID": "47110815",
            "status": {
                "url": "http://192.168.0.110/status",
                "bodyRegEx": "\"ison\":true"
             },
             "powerOn": "http://192.168.0.110/relay/0?turn=on",
             "powerOff": "http://192.168.0.110/relay/0?turn=off"
        },
        "brightness": {
            "status": {
                "url": "http://192.168.0.120/api/<apikey>/lights/6/",
                "bodyRegEx": "\"bri\":([0-9]+)"
            },
            "url": {
                "url":"http://192.168.0.120/api/<apikey>/lights/6/state",
                "body": "{\"bri\": %s}"
            },
            "http_method": "PUT",
            "max": 254
        },
        "color": {
            "status": {
                "url": "http://192.168.0.120/api/<apikey>/lights/6/",
                "bodyRegEx": "\"bri\":([0-9]+)"
            },
            "url": {
                "url":"http://192.168.0.120/api/<apikey>/lights/6/state",
                "body": "{\"xy\": [%xy-x,%xy-y]}"
            },
            "brightness": false,
            "http_method": "PUT"
        }
    }
]
 ```

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
| `notificationPassword` _(optional)_ | Password to use when device sends push notifications.  | |
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
| `status` | URL to get RGB current brightness or a [brightness status object](#brightness-status-object). |
| `url` | URL to set the current brightness of the RGB device or a [brightness url object](#brightness-url-object). |
| `http_method` _(optional)_ | The brightness specific HTTP method for set requests. If omitted defaults to `http_method` as specified in the root structure |
| `max`  _(optional)_ | This value specifies the maximum Integer for brightness. For example, Philips Hue returns 254 when brightness is at 100 % (default: 100)|

#### Brightness status object
| Key | Description |
| --- | --- |
| `url` | URL to retrieve brightness status |
| `bodyRegEx` _(optional)_ | Regular expression to extract the brightness out of a response body. Example: `"bri":([0-9]+)` |

#### Brightness url object
| Key | Description |
| --- | --- |
| `url` | URL to set brightness status |
| `body` | relevant, if the http_method is PUT/POST. this body is sent to the url. you can use a placeholder (`%s`) within the body. example: `{"bri": %s}` |


### Color object
| Key | Description |
| --- | --- |
| `status` | URL to get RGB current colour (HEX value) or a [color status object](#color-status-object). |
| `url` | URL to set the RGB colour value (HEX value) or a [color url object](#color-url-object). |
| `brightness` | Whether or not the plugin should include brightness data in `color` HEX data (`true` or `false`). When `true` brightness will be controllable in HomeKit but will be changed through changing RGB values. |
| `http_method` _(optional)_ | The brightness specific HTTP method for set requests. If omitted defaults to `http_method` as specified in the root structure |

#### Color status object
| Key | Description |
| --- | --- |
| `url` | URL to retrieve color status |
| `bodyRegEx` _(optional)_ | _Not yet supported_ |

#### Color url object
| Key | Description |
| --- | --- |
| `url` | URL to set color status |
| `body` | relevant, if the http_method is PUT/POST. this body will be sent to the url. you can use following placeholders: `%s` (hex-rgb), `%xy-x`, `%xy-y`. Example: `{"xy": [%xy-x,%xy-y]}` or `{"rgb": "%s"}` |


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
