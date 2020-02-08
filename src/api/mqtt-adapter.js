const LegacyMessageKeys = [
  'status',
  'heartbeat'
];

const GPSType = {
  0: 'NO_GPS',
  1: 'NO_FIX',
  2: '2D_FIX',
  3: '3D_FIX',
  4: 'DGPS',
  5: 'RTK_FLOAT',
  6: 'RTK_FIX',
  none: 'N/A'
};

const FlightStatus = {
  3: 'standby',
  4: 'flying',
  5: 'error',
  none: 'N/A'
};

const FlightMode = {
  3: 'auto',
  4: 'guide',
  5: 'fixed',
  6: 'back',
  9: 'land',
  none: 'N/A'
};

/**
 * @param {string} str
 * @returns {SDWC.RawNodeMessage}
 */
export function transformMessage(str) {
  let msg = {};
  if (str.trim().startsWith('{')) {
    /** @type {SDWC.NodeMessageLegacy} */
    const payload = JSON.parse(str);
    /** @type {keyof SDWC.NodeMessageLegacy} */
    const keys = Object.keys(payload);
    for (const k of keys) {
      if (!LegacyMessageKeys.includes(k)) continue;
      const v = payload[k];
      // msg.status
      let status = {};
      status.battery = {
        percent: v.battery.remain,
        voltage: v.battery.voltage
      };
      status.gps = {
        type: GPSType[v.gps.type],
        satcount: v.gps.satellites
      };
      status.status = FlightStatus[v.flight.status];
      status.mode = FlightMode[v.flight.mode];
      status.time = v.flight.time;
      status.speed = v.flight.speed;
      status.height = v.gps.height;
      // msg.position
      let position = {
        lat: v.gps.lat,
        lng: v.gps.lon,
        alt: v.gps.heihgt,
        heading: v.flight.heading
      };
      msg = { status, position };
    }
  } else {
    msg.notification = {
      time: Date.now(),
      msg: str,
      level: 2 // Info
    };
  }
  return msg;
}
