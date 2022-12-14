// @ts-check

/**
 * @typedef {ApiTypes.V3.Schedule} Schedule
 */

/** @type {Schedule[]} */
const state = [];

export const MutationTypes = {
  ADD_SCHEDULE: 'ADD_SCHEDULE',
  UPDATE_SCHEDULE: 'UPDATE_SCHEDULE',
  DELETE_SCHEDULE: 'DELETE_SCHEDULE',
  CLEAR_SCHEDULES: 'CLEAR_SCHEDULES'
};

/**
 * @type {{ [x: string]: (state: Schedule[], payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_SCHEDULE](state, /** @type {Schedule} */ payload) {
    if (state.find(s => s.id === payload.id)) return;
    state.push(payload);
  },
  [MutationTypes.UPDATE_SCHEDULE](state, /** @type {Schedule} */ payload) {
    const index = state.findIndex(p => p.id === payload.id);
    if (index < 0) return;
    state.splice(index, 1, payload);
  },
  [MutationTypes.DELETE_SCHEDULE](state, /** @type {number} */ id) {
    const index = state.findIndex(p => p.id === id);
    if (index < 0) return;
    state.splice(index, 1);
  },
  [MutationTypes.CLEAR_SCHEDULES](state) {
    state.splice(0);
  }
};

export default {
  state,
  mutations
};
