import Papaparse from 'papaparse';

import { MapActions } from '@/constants/map-actions';

/**
 * @param {SDWC.LatLng} p1
 * @param {SDWC.LatLng} p2
 * @returns {boolean}
 */
function isSamePosition(p1, p2) {
  return p1.lat === p2.lat && p1.lng === p2.lng;
}

/**
 * parse csv waypoint file to path object
 * @param {string} text
 * @returns {{ path: SDWC.LatLng[], actions: SDWC.MarkerAction[] }}
 */
export function parseWaypoints(text) {
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
    } else if (MapActions.includes(dt[3])) {
      const position = path[path.length - 1];
      const lastAction = actions[actions.length - 1];
      if (actions.length > 0 && isSamePosition(lastAction.position, position)) {
        lastAction.action.push(dt[3]);
      } else {
        actions.push({
          type: 'action',
          id: `a${actions.length}`,
          name: '',
          position: position,
          action: [dt[3]]
        });
      }
    }
  });
  return { path, actions };
}
