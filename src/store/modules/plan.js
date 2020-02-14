// @ts-check

const state = {
  /** @type {SDWC.PlanInfo[]} */
  info: []
};

export const MutationTypes = {
  ADD_PLAN: 'ADD_PLAN',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  CLEAR_PLANS: 'CLEAR_PLANS'
};

/**
 * @typedef {{ info: SDWC.PlanInfo[]; log: SDWC.PlanLog[] }} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_PLAN](state, /** @type {SDWC.PlanInfo} */ payload) {
    if (state.info.findIndex(plan => plan.id === payload.id) >= 0) return;
    state.info.push(payload);
  },
  [MutationTypes.UPDATE_PLAN](state, /** @type {SDWC.PlanInfo} */ payload) {
    const index = state.info.findIndex(plan => plan.id === payload.id);
    if (index < 0) return;
    state.info.splice(index, 1, payload);
  },
  [MutationTypes.DELETE_PLAN](state, /** @type {number} */ id) {
    const index = state.info.findIndex(p => p.id === id);
    if (index > 0) {
      state.info.splice(index, 1);
    }
    let logIndex;
    while ((logIndex = state.log.findIndex(l => l.plan_id === id)) > 0) {
      state.log.splice(logIndex, 1);
    }
  },
  [MutationTypes.CLEAR_PLANS](state) {
    state.info = [];
    state.log = [];
  }
};

export default {
  state,
  mutations
};
