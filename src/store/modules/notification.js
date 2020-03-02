// @ts-check

/**
 * @type {SDWC.NotificationItem[]}
*/
const state = [];

export const MutationTypes = {
  ADD_NOTI: 'ADD_NOTI',
  MOD_NOTI: 'MOD_NOTI',
  CLEAR_NOTI: 'CLEAR_NOTI'
};

/**
 * @type {{ [x: string]: (state: SDWC.NotificationItem[], payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_NOTI](state, /** @type {SDWC.NotificationItem} */ payload) {
    state.unshift(payload);
  },
  [MutationTypes.MOD_NOTI](state, /** @type {SDWC.NotificationItem} */ payload) {
    const n = state.find(i => i.id === payload.id);
    if (n) {
      n.status = payload.status;
    }
  },
  [MutationTypes.CLEAR_NOTI](state) {
    state.splice(0);
  }
};

export default {
  state,
  mutations
};
