// @ts-check

const state = {
  /** @type {SDWC.PlanInfo[]} */
  info: [],
  /** @type {SDWC.PlanTerm[]} */
  term: []
};

export const MutationTypes = {
  ADD_PLAN: 'ADD_PLAN',
  ADD_PLAN_OUTPUT: 'ADD_PLAN_OUTPUT',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  CLEAR_PLANS: 'CLEAR_PLANS'
};

/**
 * @typedef {{ info: SDWC.PlanInfo[], term: SDWC.PlanTerm[] }} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_PLAN](state, /** @type {SDWC.PlanInfo} */ payload) {
    if (state.info.findIndex(plan => plan.id === payload.id) >= 0) return;
    state.info.push(payload);
    state.term.push({ id: payload.id, output: [] });
  },
  [MutationTypes.ADD_PLAN_OUTPUT](state, /** @type {{ id: number, output: string }} */ payload) {
    const term = state.term.find(t => t.id === payload.id);
    if (!term) return;
    term.output.unshift({ time: Date.now() / 1000, msg: payload.output });
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
  },
  [MutationTypes.CLEAR_PLANS](state) {
    state.info = [];
    state.term = [];
  }
};

export default {
  state,
  mutations
};
