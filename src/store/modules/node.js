// @ts-check

/**
 * @typedef {{type: string; name: string; created_at: string; updated_at: string}} Point
 * @typedef {{id: number; name: string; type_name: 'air'|'depot'; description: string; points: Point[]}} NodeInfo
 * @typedef {{id: number; status: number}} NodeStatus
 * @typedef {{id: number; msg: any[]}} NodeMsg
 * @typedef {{id: number; log: string[]}} NodeLog
 */

const state = {
  /** @type {NodeInfo[]} */
  info: [],
  /** @type {NodeStatus[]} */
  status: [],
  /** @type {NodeMsg[]} */
  message: [],
  /** @type {NodeLog[]} */
  log: []
};

/**
 * @typedef {typeof state} State
*/

export const MutationTypes = {
  ADD_NODE: 'ADD_NODE',
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  ADD_NODE_MSG: 'ADD_NODE_MSG',
  ADD_NODE_LOG: 'ADD_NODE_LOG'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_NODE](state, /** @type {NodeInfo} */ payload) {
    if (state.info.findIndex(node => node.id === payload.id) >= 0) return;
    state.info.push(payload);
    state.status.push({ id: payload.id, status: -1 });
    state.message.push({ id: payload.id, msg: [] });
    state.log.push({ id: payload.id, log: [] });
  },
  [MutationTypes.SET_NODE_STATUS](state, { id, status }) {
    const st = state.status.find(node => node.id === id);
    if (st) {
      st.status = status;
    }
  },
  [MutationTypes.ADD_NODE_MSG](state, { id, msg }) {
    let nodeMsg = state.message.find(node => node.id === id);
    if (nodeMsg) {
      nodeMsg.msg.unshift(msg);
    }
  },
  [MutationTypes.ADD_NODE_LOG](state, { id, log }) {
    let nodeLog = state.log.find(node => node.id === id);
    if (nodeLog) {
      nodeLog.log.push(log);
    }
  }
};

export default {
  state,
  mutations
};
