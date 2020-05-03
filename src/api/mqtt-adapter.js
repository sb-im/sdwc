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
  5: 'fixed',  // not present in new modes, keep it as-is
  6: 'rtl',    // previously 'back'
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
      // msg.drone_status
      let ds = {};
      ds.battery = {
        percent: v.battery.remain,
        voltage: v.battery.voltage
      };
      ds.gps = {
        type: GPSType[v.gps.type],
        satcount: v.gps.satellites
      };
      ds.status = FlightStatus[v.flight.status];
      ds.mode = FlightMode[v.flight.mode];
      ds.time = v.flight.time;
      ds.speed = v.flight.speed;
      ds.height = v.gps.height;
      // msg.position
      let pos = {
        lat: v.gps.lat,
        lng: v.gps.lon,
        alt: -1,
        heading: v.flight.heading
      };
      msg = {
        drone_status: ds,
        position: pos
      };
    }
  } else {
    msg.notification = {
      time: Date.now() / 1000,
      msg: str,
      level: 6 // Info
    };
  }
  return msg;
}
