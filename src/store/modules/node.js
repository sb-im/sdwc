// @ts-check

/**
 * @typedef {{type: string; name: string; created_at: string; updated_at: string}} Point
 * @typedef {{id: number; name: string; type_name: 'air'|'depot'; description: string; points: Point[]}} NodeInfo
 * @typedef {{id: number; status: number}} NodeStatus
 * @typedef {{id: number; msg: string[]}} NodeMsg
 */

const state = {
  /** @type {NodeInfo[]} */
  info: [],
  /** @type {NodeStatus[]} */
  status: [],
  /** @type {NodeMsg[]} */
  message: []
};

/**
 * @typedef {typeof state} State
*/

export const MutationTypes = {
  ADD_NODE: 'ADD_NODE',
  SET_NODE_STATUS: 'SET_NODE_STATUS',
  ADD_NODE_MSG: 'ADD_NODE_MSG'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_NODE](state, /** @type {NodeInfo} */ payload) {
    if (state.info.findIndex(node => node.id === payload.id) >= 0) return;
    state.info.push(payload);
    state.status.push({ id: payload.id, status: -1 });
  },
  [MutationTypes.SET_NODE_STATUS](state, { id, status }) {
    const st = state.status.find(node => node.id === id);
    if (st) {
      st.status = status;
    }
  },
  [MutationTypes.ADD_NODE_MSG](state, { id, msg }) {
    let nodeMsg = state.message.find(node => node.id === id);
    if (!nodeMsg) {
      nodeMsg = { id, msg: [] };
      state.message.push(nodeMsg);
    }
    nodeMsg.msg.push(msg);
  }
};

export default {
  state,
  mutations
};
