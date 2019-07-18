// @ts-check

/**
 * @typedef {{id: string; time: number; prefix: string; title: string; status: number}} NotificationItem
 * @type {NotificationItem[]}
*/
const state = [];

/**
 * @typedef {typeof state} State
 */

export const MutationTypes = {
  ADD_NOTI: 'ADD_NOTI',
  MOD_NOTI: 'MOD_NOTI',
  CLEAR_NOTI: 'CLEAR_NOTI'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_NOTI](state, /** @type {NotificationItem} */ payload) {
    state.unshift(payload);
  },
  [MutationTypes.MOD_NOTI](state, /** @type {NotificationItem} */ payload) {
    const n = state.find(i => i.id === payload.id);
    if (n) {
      n.status = payload.status;
    }
  },
  [MutationTypes.CLEAR_NOTI](state) {
    state.splice(0, state.length);
  }
};

export default {
  state,
  mutations
};
