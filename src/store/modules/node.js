// @ts-check

/**
 * @typedef {{id: number; name: string; node_id: number; point_type_id: number; point_type_name: string; created_at: string; updated_at: string}} Point
 * @typedef {{id: number; name: string; type_name: 'air'|'depot'; description: string; points: Point[]}} NodeInfo
 * @typedef {number} NodeStatus
 * @typedef {any} NodeMsg
 * @typedef {string[]} NodeLog
 * @typedef {{lat: number, lng: number}} NodePosition
 * @typedef {NodePosition[]} NodePath
 * @typedef {{WD: number, WS: number, T: number, RH: number, Pa: number}} NodeWeather
 * @typedef {{time: number, weather: NodeWeather}[]} WeatherRecord
 * @typedef {{info: NodeInfo; status: NodeStatus; msg: NodeMsg; log: NodeLog; position: NodePosition; path: NodePath; weatherRec: WeatherRecord}} Node
 */

/** @type {Node[]} */
const state = [];

/**
 * @typedef {typeof state} State
*/

export const MutationTypes = {
  ADD_NODE: 'ADD_NODE',
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  ADD_NODE_MSG: 'ADD_NODE_MSG',
  ADD_NODE_LOG: 'ADD_NODE_LOG',
  CLEAR_NODES: 'CLEAR_NODES'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_NODE](state, /** @type {NodeInfo} */ payload) {
    const node = state.find(node => node.info.id === payload.id);
    if (node) {
      return;
    }
    state.push({
      info: payload,
      status: -1,
      msg: {},
      log: [],
      position: null,
      path: [],
      weatherRec: []
    });
  },
  [MutationTypes.SET_NODE_STATUS](state, { id, status }) {
    const node = state.find(node => node.info.id === id);
    if (node) {
      node.status = status;
    }
  },
  [MutationTypes.ADD_NODE_MSG](state, { id, msg }) {
    const node = state.find(node => node.info.id === id);
    if (node) {
      node.msg = { ...node.msg, ...msg };
      switch (node.info.type_name) {
        case 'air':
          if (msg.status) {
            const { lon: lng, lat } = msg.status.gps;
            node.position = { lng, lat };
            node.path.unshift(node.position);
          }
          break;
        case 'depot':
          if (msg.status) {
            const { lng, lat } = msg.status;
            node.position = { lng: +lng, lat: +lat };
          } else if (msg.weather) {
            const time = Date.now();
            node.weatherRec.push({ time, weather: msg.weather });
            let earliest = node.weatherRec[0];
            while (time - earliest.time > 60000) {
              node.weatherRec.shift();
              earliest = node.weatherRec[0];
            }
          }
          break;
      }
    }
  },
  [MutationTypes.ADD_NODE_LOG](state, { id, log }) {
    const node = state.find(node => node.info.id === id);
    if (node) {
      node.log.push(log);
    }
  },
  [MutationTypes.CLEAR_NODES](state) {
    state.splice(0, state.length);
  }
};

export default {
  state,
  mutations
};
