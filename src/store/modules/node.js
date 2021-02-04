// @ts-check

/** @type {SDWC.Node[]} */
const state = [];

export const MutationTypes = {
  ADD_NODE: 'ADD_NODE',
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  SET_NODE_NETWORK: 'SET_NODE_NETWORK',
  ADD_NODE_MSG: 'ADD_NODE_MSG',
  ADD_NODE_TOPIC: 'ADD_NODE_TOPIC',
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
      network: {
        loss: -1,
        delay: -1
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
          yaw: 0,
          pitch: 0,
          zoom: 1,
          source: ''
        },
        action_enabled: [],
        overlay_screen: {
          width: 0,
          height: 0,
          shapes: []
        },
        position: [],
        place: {},
        heatmap: [],
        waypoint: {},
        notification: [],
        overview: {}
      }
    });
  },
  [MutationTypes.SET_NODE_STATUS](state, /** @type {{ id: number, payload: Partial<SDWC.NodeConnectionStatus> }} */ { id, payload }) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    if (payload.status) {
      for (const k of ['lng', 'lat', 'alt']) {
        if (typeof payload.status[k] === 'string') {
          payload.status[k] = Number.parseFloat(payload.status[k]);
        }
      }
    }
    Object.assign(node.status, payload);
  },
  [MutationTypes.SET_NODE_NETWORK](state, /** @type {{ id: number, payload: SDWC.NodeNetworkStatus }} */ { id, payload }) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    Object.assign(node.network, payload);
  },
  [MutationTypes.ADD_NODE_MSG](state, /** @type {{ id: number, msg: SDWC.RawNodeMessage }} */ { id, msg }) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    for (const [category, value] of Object.entries(msg)) {
      switch (category) {
        case 'position':
          node.msg.position.unshift(msg.position);
          if (node.msg.position.length > 1024) {
            node.msg.position.splice(1024);
          }
          break;
        case 'notification':
          if (node.msg.notification.findIndex(n => n.time === msg.notification.time) < 0) {
            node.msg.notification.unshift(msg.notification);
          }
          break;
        default:
          node.msg[category] = value;
          break;
      }
    }
  },
  [MutationTypes.ADD_NODE_TOPIC](state, /** @type {{ id: number, topic: string }} */ { id, topic }) {
    const node = state.find(node => node.info.id === id);
    if (!node) return;
    // @ts-ignore
    // replace msg object, make new property reactive
    node.msg = { ...node.msg, [topic]: {} };
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
