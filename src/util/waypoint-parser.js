import Papaparse from 'papaparse';

/**
 * @param {SDWC.LatLng} p1
 * @param {SDWC.LatLng} p2
 * @returns {boolean}
 */
function isSamePosition(p1, p2) {
  return p1.lat === p2.lat && p1.lng === p2.lng;
}

/**
 * create action object
 * @param {string} id
 * @param {SDWC.LatLng} position
 * @param  {...string} action
 * @returns {SDWC.MarkerAction}
 */
function makeAction(id, position, ...action) {
  return {
    type: 'action',
    id,
    name: '',
    position,
    action
  };
}

/**
 * use unicode codepoint to display iconfont glyph, workaround Safari issues
 * for complete list of codepoint <-> glyph
 * @see https://github.com/jossef/material-design-icons-iconfont/blob/v6.1.0/src/_variables.scss
 */
const HomeMark = '\uE88A';   // home

/**
 * prepend action 'home' to first point in path
 * @param {SDWC.LatLng[]} path
 * @param {SDWC.MarkerAction[]} actions
 */
function prependHomeMark(path, actions) {
  if (actions.length > 0 && isSamePosition(actions[0].position, path[0])) {
    actions[0].action.unshift(HomeMark);
  } else {
    actions.unshift(makeAction('home', path[0], HomeMark));
  }
}

const MAVLinkActions = {
  '2000': '\uE3B0', // camera_alt
  '203': '\uE3B0',  // camera_alt
  '20': '\uE042'    // replay
};

/**
 * parse csv waypoint file to path object
 * @param {string} text
 * @returns {{ path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseMAVLinkWaypoints(text) {
  /** @type {SDWC.LatLng[]} */
  const path = [];
  /** @type {SDWC.MarkerAction[]} */
  const actions = [];
  Papaparse.parse(text).data.forEach((/** @type {string[]} */ dt) => {
    if (dt[3] === '16') {
      path.push({
        lat: Number.parseFloat(dt[8]),
        lng: Number.parseFloat(dt[9])
      });
    } else if (Object.prototype.hasOwnProperty.call(MAVLinkActions, dt[3])) {
      const position = path[path.length - 1];
      const lastAction = actions[actions.length - 1];
      const a = MAVLinkActions[dt[3]];
      if (actions.length > 0 && isSamePosition(lastAction.position, position)) {
        lastAction.action.push(a);
      } else {
        actions.push(makeAction(`a${actions.length}`, position, a));
      }
    }
  });
  return { path, actions };
}

const KMLActions = {
  'ShootPhoto': '\uE3B0',      // camera_alt
  'StartRecording': '\uE04B',  // videocam
  'StopRecording': '\uE04C'    // videocam_off
};

/**
 * parse KML file to path object
 * @param {string} text KML text
 * @returns {{ path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseKML(text) {
  /** @type {SDWC.LatLng[]} */
  const path = [];
  /** @type {SDWC.MarkerAction[]} */
  const actions = [];
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  const placemarks = xml.querySelectorAll('Document>Folder>Placemark');
  const placemarkArray = Array.from(placemarks).sort((a, b) => {
    const [ia, ib] = [a, b].map(e => Number.parseInt(e.querySelector('name').textContent.replace(/[A-Za-z]/g, ''), 10));
    return ia - ib;
  });
  for (const pm of placemarkArray) {
    const [lng, lat /*, alt */] = pm.querySelector('Point>coordinates').textContent.split(',').map(Number.parseFloat);
    const position = { lng, lat };
    path.push(position);
    const extData = pm.querySelector('ExtendedData');
    const action = makeAction(`a${actions.length}`, position);
    for (const mis of Array.from(extData.children)) {
      switch (mis.tagName) {
        case 'mis:actions':
          // eslint-disable-next-line no-case-declarations
          const a = KMLActions[mis.textContent];
          if (!a) continue;
          if (!action.action.includes(a)) {
            action.action.push(a);
          }
          break;
      }
    }
    if (action.action.length > 0) {
      actions.push(action);
    }
  }
  prependHomeMark(path, actions);
  return { path, actions };
}

/**
 * parse DroneDeploy json file
 * @param {string} text JSON text
 * @returns {{ boundary: SDWC.LatLng[], path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseDroneDeployJSON(text) {
  const json = JSON.parse(text);
  /** @type {SDWC.LatLng[]} */
  const boundary = json.geometry.map(point => ({ lat: point.lat, lng: point.lng }));
  /** @type {SDWC.LatLng[]} */
  const path = json.waypoints.map(point => ({ lat: point.lat, lng: point.lng }));
  /** @type {SDWC.MarkerAction[]} */
  const actions = [];
  prependHomeMark(path, actions);
  return { boundary, path, actions };
}

const LitchiActions = {
  // '0': 'stay for',
  '1': '\uE3B0',   // camera_alt
  '2': '\uE04B',   // videocam
  '3': '\uE04C',   // videocam_off
  // '4': 'rotate aircraft',
  // '5': 'tlit camera'
};

/**
 * parse litchi csv waypoint file to path object
 * @param {string} text
 * @returns {{ path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseLitchiCSV(text) {
  /** @type {SDWC.LatLng[]} */
  const path = [];
  /** @type {SDWC.MarkerAction[]} */
  const actions = [];
  const results = Papaparse.parse(text, { dynamicTyping: true, header: true });
  for (const point of results.data) {
    if (typeof point.longitude !== 'number' || typeof point.latitude !== 'number') continue;
    const position = { lng: point.longitude, lat: point.latitude };
    path.push(position);
    const action = makeAction(`a${actions.length}`, position);
    for (let i = 1; i <= 15; i++) {
      const kType = `actiontype${i}`;
      // const kParam = `actionparam${i}`;
      const a = LitchiActions[point[kType]];
      if (a && !action.action.includes(a)) {
        action.action.push(a);
      }
    }
    if (action.action.length > 0) {
      actions.push(action);
    }
  }
  prependHomeMark(path, actions);
  return { path, actions };
}

/**
 * parse waypoint file to path object
 * @param {string} text
 * @returns {SDWC.ParsedWaypoint}
 */
export function parseWaypoints(text) {
  const t = text.trim();
  if (/^<\?xml/i.test(t) && /<kml/i.test(t)) {
    return parseKML(text);
  } else if (t.startsWith('{')) {
    return parseDroneDeployJSON(text);
  } else if (t.startsWith('lat')) {
    return parseLitchiCSV(text);
  }
  return parseMAVLinkWaypoints(text);
}
