import Papaparse from 'papaparse';

/**
 * @param {SDWC.LatLng} p1
 * @param {SDWC.LatLng} p2
 * @returns {boolean}
 */
function isSamePosition(p1, p2) {
  return p1.lat === p2.lat && p1.lng === p2.lng;
}

const CSVActions = {
  '2000': '📷',
  '203': '📷',
  '20': '↩️'
};

/**
 * parse csv waypoint file to path object
 * @param {string} text
 * @returns {{ path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseCSV(text) {
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
    } else if (Object.prototype.hasOwnProperty.call(CSVActions, dt[3])) {
      const position = path[path.length - 1];
      const lastAction = actions[actions.length - 1];
      if (actions.length > 0 && isSamePosition(lastAction.position, position)) {
        lastAction.action.push(CSVActions[dt[3]]);
      } else {
        actions.push({
          type: 'action',
          id: `a${actions.length}`,
          name: '',
          position: position,
          action: [CSVActions[dt[3]]]
        });
      }
    }
  });
  return { path, actions };
}

const KMLActions = {
  'ShootPhoto': '📷'
};

const HomeMark = '🏠';

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
  for (const pm of Array.from(placemarks)) {
    const [lng, lat /*, alt */] = pm.querySelector('Point>coordinates').textContent.split(',').map(Number.parseFloat);
    const position = { lng, lat };
    path.push(position);
    const extData = pm.querySelector('ExtendedData');
    /** @type {SDWC.MarkerAction} */
    const action = {
      type: 'action',
      id: `a${actions.length}`,
      name: '',
      position,
      action: []
    };
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
  if (actions.length > 0 && isSamePosition(actions[0].position, path[0])) {
    actions[0].action.unshift(HomeMark);
  } else {
    actions.unshift({
      type: 'action',
      id: `a${actions.length}`,
      name: '',
      position: path[0],
      action: [HomeMark]
    });
  }
  return { path, actions };
}

/**
 * parse waypoint file to path object
 * @param {string} text
 * @returns {{ path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseWaypoints(text) {
  const t = text.trim();
  if (/^<\?xml/i.test(t) && /<kml/i.test(t)) {
    return parseKML(text);
  }
  return parseCSV(text);
}
