// @ts-check

const state = {
  /** @type {SDWC.PlanInfo[]} */
  info: [],
  /** @type {SDWC.PlanTerm[]} */
  term: [],
  /** @type {SDWC.PlanDialog[]} */
  dialog: [],
  /** @type {SDWC.PlanRunning[]} */
  running: []
};

export const MutationTypes = {
  ADD_PLAN: 'ADD_PLAN',
  ADD_PLAN_MSG: 'ADD_PLAN_MSG',
  SET_PLAN_RUNNING: 'SET_PLAN_RUNNING',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  CLEAR_PLANS: 'CLEAR_PLANS'
};

/**
 * @typedef {typeof state} State
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_PLAN](state, /** @type {SDWC.PlanInfo} */ payload) {
    if (state.info.findIndex(plan => plan.id === payload.id) >= 0) return;
    state.info.push(payload);
    state.term.push({ id: payload.id, output: [] });
  },
  [MutationTypes.ADD_PLAN_MSG](state, /** @type {{ id: number, output?: string, dialog?: SDWC.PlanDialogContent }} */ payload) {
    if (typeof payload.output === 'string') {
      const term = state.term.find(t => t.id === payload.id);
      if (!term) return;
      term.output.unshift({ time: Date.now() / 1000, msg: payload.output });
    }
    if (typeof payload.dialog === 'object') {
      const d = {
        id: payload.id,
        time: Date.now(),
        dialog: payload.dialog
      };
      const exist = state.dialog.findIndex(d => d.id === payload.id);
      const empty = Object.getOwnPropertyNames(payload.dialog).length === 0;
      if (exist >= 0) {
        if (empty) {
          state.dialog.splice(exist, 1);
        } else {
          state.dialog.splice(exist, 1, d);
        }
      } else if (!empty) {
        state.dialog.unshift(d);
      }
    }
  },
  [MutationTypes.SET_PLAN_RUNNING](state, /** @type {{ id: number, running: SDWC.PlanRunningContent }} */ payload) {
    const index = state.info.findIndex(plan => plan.id === payload.id);
    if (index < 0) return;
    const exist = state.running.findIndex(r => r.id === payload.id);
    const empty = Object.getOwnPropertyNames(payload.running).length === 0;
    if (exist >= 0) {
      if (empty) {
        state.running.splice(exist, 1);
      } else {
        state.running.splice(exist, 1, payload);
      }
    } else if (!empty) {
      state.running.unshift(payload);
    }
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
    state.dialog = [];
    state.running = [];
  }
};

export default {
  state,
  mutations
};
