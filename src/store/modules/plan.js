// @ts-check

/** @type {SDWC.PlanState[]} */
const state = [];

export const MutationTypes = {
  ADD_PLAN: 'ADD_PLAN',
  ADD_PLAN_TERM: 'ADD_PLAN_TERM',
  SET_PLAN_DIALOG: 'SET_PLAN_DIALOG',
  SET_PLAN_RUNNING: 'SET_PLAN_RUNNING',
  ADD_PLAN_NOTIFY: 'ADD_PLAN_NOTIFY',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  CLEAR_PLANS: 'CLEAR_PLANS'
};

/**
 * @type {{ [x: string]: (state: SDWC.PlanState[], payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_PLAN](state, /** @type {SDWC.PlanInfo} */ payload) {
    if (state.findIndex(plan => plan.info.id === payload.id) >= 0) return;
    state.push({
      info: payload,
      term: [],
      dialog: null,
      running: null,
      notification: []
    });
  },
  [MutationTypes.ADD_PLAN_TERM](state, /** @type {{ id: number, output: string }} */ payload) {
    const plan = state.find(p => p.info.id === payload.id);
    if (!plan) return;
    plan.term.unshift({ time: Date.now() / 1000, msg: payload.output });
  },
  [MutationTypes.SET_PLAN_DIALOG](state, /** @type {{ id: number, dialog?: SDWC.PlanDialogContent }} */ payload) {
    const plan = state.find(p => p.info.id === payload.id);
    if (!plan) return;
    const empty = Object.getOwnPropertyNames(payload.dialog).length === 0;
    plan.dialog = empty ? null : Object.assign({ time: Date.now() }, payload.dialog);
  },
  [MutationTypes.SET_PLAN_RUNNING](state, /** @type {{ id: number, running: SDWC.RunningTask }} */ payload) {
    const plan = state.find(p => p.info.id === payload.id);
    if (!plan) return;
    const empty = Object.getOwnPropertyNames(payload.running).length === 0;
    plan.running = empty ? null : payload.running;
  },
  [MutationTypes.UPDATE_PLAN](state, /** @type {SDWC.PlanInfo} */ payload) {
    const plan = state.find(p => p.info.id === payload.id);
    if (!plan) return;
    plan.info = payload;
  },
  [MutationTypes.DELETE_PLAN](state, /** @type {number} */ id) {
    const index = state.findIndex(p => p.info.id === id);
    if (index < 0) return;
    state.splice(index, 1);
  },
  [MutationTypes.CLEAR_PLANS](state) {
    state.splice(0);
  }
};

export default {
  state,
  mutations
};
