# Online Status

### Sub: `nodes/:id/status`
```json
{
  "code":0,
  "msg":"",
  "status": {
    "link_id":1,
    "position_ok":true,
    "lat":"22.687713",
    "lng":"114.224837",
    "alt":"74.839996"
  }
}
```

status_code_map = {
  online: 0,
  offline: 1,
  neterror: 2
}

# JSON-RPC
> https://www.jsonrpc.org/

#### Send
### Pub: `nodes/:id/rpc/send`
```json
{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": "sdwc-1"}
```

**Id must is the Unique id**

Id must String

For sdwc:
Id: `sdwc-<unique_id>` Or `sdwc.<user id>-<timestamp>`

#### Recv
### Sub: `nodes/:id/rpc/recv`
```json
{"jsonrpc": "2.0", "result": 19, "id": "sdwc-1"}
```

Or

```json
{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "sdwc-1"}
```


# Point

## weather
### params
```json
{}
```

### `nodes/:id/msg/weather`
-> `{"WS":1}`

Or

-> `{"WD":0,"WS":1}`

Or

-> `{"WD":0,"WS":1,"t":25,"RH":42}`

Name | Type | Description
---- | ---- | -----------
WD   | uint | Opt: Wind Direction (0 ~ 360) °
WS   | float| Opt: Wind Speed [m/s]
T    | float| Opt: Temperature Kelvin [K] **Priority: (T > t > F)**
t    | float| Opt: Temperature Celsius [°C]
F    | float| Opt: Temperature Fahrenheie [°F]
RH   | uint | Opt: Relative humidity (0 ~ 99)％

**Real-time weather PATCH Weather forecast**


## battery
### `nodes/:id/msg/battery`
```json
{"temp": 27, "cap": 8634, "cur": "2561", "remain": 71, "cycle": 0, "vol_cell": "3941/3948/3944/3945/3943/3942", "status": ["Switch OFF Discharging", "Switch OFF Charging"], "bal": 0, "id": "591906111641001"}
```

Name | Type | Description
---- | ---- | -----------
temp | float| Temperature [°C]
cap  | uint | Capacity [mA*h]
cur  | string | current [mA] If Charging have `-`
cycle| uint | Cycles
remain|uint | remaining battery [%]
vol_cell| string | Cell voltage [mV]
bal | int | Unknown
id  | string | Unique id


[]status :string
```
DISCHARGING
CHARGING
Charging Fully
Switch ON Discharging
Switch OFF Discharging
Switch ON Charging
Switch OFF Charging
PROTECTION(Short-circuited)
PROTECTION(Low Temperature)
PROTECTION(High Temperature)
PROTECTION(Low Temperature Charging)
PROTECTION(High Temperature Charging)
PROTECTION(Overcharging)
PROTECTION(Over Discharging)
PROTECTION(Overcurrent Charging)
PROTECTION(Overcurrent Discharging)
```

## drone_status
### `nodes/:id/msg/drone_status`
```json
{"status":"standby","mode":"auto","time":0,"speed":0.15,"height":-0.07,"gps":{"type":"RTK_FIX","satcount":10},"battery":{"percent":100,"voltage":12.59},"signal":50}
```

Name | Type   | Description
---- | ------ | -----------
status|string | Enum `standby, flying, error`
mode | string | Enum `auto, guide, rtl, land, loiter, unknown` http://ardupilot.org/copter/docs/flight-modes.html
time | uint   | flight time [s]
speed| float  | Ground speed [m/s]
height| float | Relative height at the takeoff point
gps.type|string| Enum `NO_GPS, NO_FIX, 2D_FIX, 3D_FIX, DGPS, RTK_FLOAT, RTK_FIX`
gps.satcount| uint  | GPS satellites count
battery.percent| uint | 1-100 [%]
battery.voltage| float  | voltage [v]
signal| uint  | Signal strength 1-100 [%]


## depot_status
### `nodes/:id/msg/depot_status`
```json
{"status": "running","power":"cable","door":"close","fix":"close"}
```

Name | Type   | Description
---- | ------ | -----------
status|string | Enum `ready, running, protect, error`
power |string | Enum `cable, ups, solar`
door  |string | Enum `opened, moving, closed`
fix   |string | Enum `opened, moving, closed`

## charger
### `nodes/:id/msg/charger`
```json
{"status": "ready","V":"1.7","A":"0.4"}
```

Name | Type   | Description
---- | ------ | -----------
status|string | Enum `ready, charging, protect, error`
V     |float | Voltage [V]
A     |float | Electric current [A]

### RPC: charger_info
#### Request:
```json
{"jsonrpc":"2.0","method":"charger_info","id":"sdwc-3"}
```
#### Response:
```json
{"jsonrpc":"2.0",
  "result":{
    "info":{"set_voltage":5.5, "set_current": 3.5},
    "history_info":{"timestamp":1582975681,"intervalsl":30},
    "history": [
      {"V":"1.7","A":"0.4"},
      {"V":"1.7","A":"0.5"},
      {"V":"1.7","A":"0.7"}
    ]
  },
"id":"sdwc-3"}
```

**`history_info.timestamp` is `history[0]` timestamp**

## monitor
### Params
```json
{"mode":["manual","auto","rc"],"yaw":[-90,90],"pitch":[-90,45]}
```

### Sub: `nodes/:id/msg/gimbal`
```json
{"mode":"auto","yaw":0,"pitch":0}
```

Name | Type   | Description
---- | ------ | -----------
mode | string | gimbal_mode
yaw  | int    |
pitch| int    |

### RPC: gimbal_mode
#### Request:
```json
{"jsonrpc":"2.0","method":"gimbal_mode","params":["manual"]}
```
Or
```json
{"jsonrpc":"2.0","method":"gimbal_mode","params":["manual"],"id":"sdwc-2"}
```
#### Response:
```json
{"jsonrpc":"2.0","result":"manual","id":"sdwc-2"}
```
**gimbal_mode `manual` As a special mode, Can only be use `gimbal_ctl` in `gimbal_mode == manual`**

### RPC: gimbal_ctl
#### Request:
```json
{"jsonrpc":"2.0","method":"gimbal_ctl","params":{"yaw":-37,"pitch":0}}
```
Or
```json
{"jsonrpc":"2.0","method":"gimbal_ctl","params":{"yaw":-37,"pitch":0},"id":"sdwc-3"}
```
#### Response:
```json
{"jsonrpc":"2.0","result":{"yaw":-37,"pitch":0},"id":"sdwc-3"}
```

## map
### Params
```json
{
  "common":{
    "move":[
      {"method":"goto"},
      {"method":"pointto"},
      {"method":"setROI","params":{"height":{ "type": "number", "required": false }}},
      {"method":"goto_params","params":{
        "height":{ "type": "number", "required": true },
        "speed":{ "type": "number", "default": 3, "required": false }
        }
      }
    ]
  },
  "map":{
    "google":{"proxy":"sb.im"},
    "amap":{}
  },
  "place":{
    "home":{"stroke":"dotted", "color":"#67c23a"},
    "target":{"stroke":"dashed"},
    "roi":{"stroke":"solid", "color":"#f69730"},
    "point_to":{"point":"glow", "color":"#f69730"}
  }
}
```

### Sub: `nodes/:id/msg/position`
```json
{"lat":22.6876423001,"lng":114.2248673001,"alt":51.57,"height":20.1,"heading":10,
  "place":{
    "home":{"lat":22.6876423001,"lng":114.2248673001,"alt":41.85},
    "roi":{"lat":22.6876423001,"lng":114.2248673001,"alt":0.07},
    "target":{"lat":22.6876423001,"lng":114.2248673001,"alt":41.85}
  },
  "heatmap":[
    {"lat":22.6876423001,"lng":114.2248673001,"weight":1},
    {"lat":22.6876426001,"lng":114.2248676001,"weight":3}
  ]
}
```

Name | Type   | Description
---- | ------ | -----------
lat  | float | Latitude
lng  | float | Longitude
alt  | float | Altitude
height | float| Relative height
heading| uint | Heading 0°~360°
place  | object | Opt: (May not exist)
place.[name] | string | Can have multiple
place.[name].lat  | float | Latitude
place.[name].lng  | float | Longitude
place.[name].alt  | float | Altitude
heatmap | array | Opt: (May not exist)
heatmap.lat | float | Latitude
heatmap.lng | float | Longitude
heatmap.weight | float | Weighted Location

### RPC: move
#### Request:
```json
{
  "jsonrpc":"2.0","method":"<common.move.method>",
  "params":{
    "lat":22.6876423001,"lng":114.2248673001,
    "<common.move.params.key>":"<input: default=common.move.params.value.default>"
  },
  "id":"sdwc-3"
}
```
#### Response:
```json
{"jsonrpc":"2.0","result":{"current":{"lat":22.6876423001,"lng":114.2248673001}},"id":"sdwc-3"}
```


## `nodes/:id/msg/notification`
```json
{"time":1565413755,"level":1,"msg":""}
```

Name | Type   | Description
---- | ------ | -----------
time | uint64 | timestamp length `10`
level| uint   | 0-7 `0: Emergency, 1: Alert, 2: Critical, 3: Error, 4: Warn, 5: Notice, 6: Info, 7: Debug` Reference: [RFC5424](https://tools.ietf.org/html/rfc5424#section-6.2.1)
msg  | string | message body


## debug
### Params
```json
[
  {"method":"move_x_open"},
  {"method":"move_x_close"},
  {"method":"goto_params","params":{"alt":{"type": "number", "default": 0, "required": true}}}
]
```


### ~~Sub: `nodes/:id/message`~~ *Discard*
```json
{"heartbeat": {"battery": {"remain": 99, "voltage": 48280}, "flight": {"status": 3, "speed": 0.08756901323795319, "mode": 0, "time": "111"}, "gps": {"satellites": 4, "lat": 226878281, "height": 2.669999837875366, "type": 3, "lon": 1142245713}}}
```

