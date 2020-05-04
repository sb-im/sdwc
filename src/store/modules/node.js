// @ts-check

/** @type {SDWC.Node[]} */
const state = [];

export const MutationTypes = {
  ADD_NODE: 'ADD_NODE',
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  ADD_NODE_MSG: 'ADD_NODE_MSG',
  ADD_NODE_LOG: 'ADD_NODE_LOG',
  CLEAR_NODE_PATH: 'CLEAR_NODE_PATH',
  CLEAR_NODES: 'CLEAR_NODES'
};

/**
 * @type {{ [x: string]: (state: SDWC.Node[], payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_NODE](state, /** @type {SDWC.NodeInfo} */ payload) {
    const node = state.find(node => node.info.id === payload.id);
    if (node) return;
    state.push({
      info: payload,
      status: {
        code: -1,
        msg: '',
        status: {
          link_id: -1,
          position_ok: null,
          lat: '',
          lng: '',
          alt: ''
        }
      },
      msg: {
        weather: {
          WS: 0
        },
        battery: {
          id: '',
          temp: 0,
          cap: 0,
          cur: '',
          remain: 0,
          cycle: 0,
          vol_cell: '',
          status: [],
          bal: 0
        },
        charger: {
          status: 'error',
          V: 0,
          A: 0
        },
        depot_status: {
          status: 'error',
          power: 'cable',
          door: 'closed',
          fix: 'closed'
        },
        drone_status: {
          status: 'error',
          mode: 'unknown',
          time: 0,
          speed: 0,
          height: 0,
          gps: {
            type: 'NO_GPS',
            satcount: 0
          },
          battery: {
            percent: 0,
            voltage: 0
          },
          signal: 0
        },
        gimbal: {
          mode: '',
          yaw: 0,
          pitch: 0
        },
        position: [],
        notification: [],
        overview: {}
      }
    });
  },
  [MutationTypes.SET_NODE_STATUS](state, /** @type {{ id: number, payload: Partial<SDWC.NodeConnectionStatus> }} */ { id, payload }) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    Object.assign(node.status, payload);
  },
  [MutationTypes.ADD_NODE_MSG](state, /** @type {{ id: number, msg: SDWC.RawNodeMessage }} */ { id, msg }) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    if (msg.weather) {
      node.msg.weather = msg.weather;
    }
    if (msg.battery) {
      node.msg.battery = msg.battery;
    }
    if (msg.charger) {
      node.msg.charger = msg.charger;
    }
    if (msg.depot_status) {
      node.msg.depot_status = msg.depot_status;
    }
    if (msg.drone_status) {
      node.msg.drone_status = msg.drone_status;
    }
    if (msg.gimbal) {
      node.msg.gimbal = msg.gimbal;
    }
    if (msg.position) {
      node.msg.position.unshift(msg.position);
      if (node.msg.position.length > 1024) {
        node.msg.position.splice(1024);
      }
    }
    if (msg.notification) {
      if (node.msg.notification.findIndex(n => n.time === msg.notification.time) < 0) {
        node.msg.notification.unshift(msg.notification);
      }
    }
    if (msg.overview) {
      node.msg.overview = msg.overview;
    }
  },
  [MutationTypes.CLEAR_NODE_PATH](state, /** @type {number} */ id) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    node.msg.position.splice(1);
  },
  [MutationTypes.CLEAR_NODES](state) {
    state.splice(0);
  }
};

export default {
  state,
  mutations
};
