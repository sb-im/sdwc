# Online Status

### Sub: `nodes/:id/status`
-> `0`

status_map = {
  online: 0,
  offline: 1,
  neterror: 2
}

# JSON-RPC
> https://www.jsonrpc.org/

#### Send
### Pub: `nodes/:id/rpc/send`
-> `{"jsonrpc": "2.0", "method": "subtract", "params": [42, 23], "id": "sdwc-1"}`

**Id must is the Unique id**

Id must String

For sdwc:
Id: `sdwc-<unique_id>`

#### Recv
### Sub: `nodes/:id/rpc/recv`
-> `{"jsonrpc": "2.0", "result": 19, "id": "sdwc-1"}`

Or

-> `{"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}, "id": "sdwc-1"}`

# Message
### Sub: `nodes/:id/message`

-> `{"heartbeat": {"battery": {"remain": 99, "voltage": 48280}, "flight": {"status": 3, "speed": 0.08756901323795319, "mode": 0, "time": "111"}, "gps": {"satellites": 4, "lat": 226878281, "height": 2.669999837875366, "type": 3, "lon": 1142245713}}}`

