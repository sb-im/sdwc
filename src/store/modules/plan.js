// @ts-check

/**
 * @typedef {{id: number; name: string; description: string; node_id?: number; depot_id?: number; cycle_types_id: number; map_path: string; created_at: string; updated_at: string}} PlanInfo
 * @typedef {{id: number; plan_id: number; raw_data?: string; orthomosaic_path?: string; air_log_path?: string; sever_log_path?: string; created_at: string; updated_at: string}} PlanLog
 */

const state = {
  /** @type {PlanInfo[]} */
  info: [],
  /** @type {PlanLog[]} */
  log: []
};

/**
 * @typedef {typeof state} State
 */

export const MutationTypes = {
  ADD_PLAN: 'ADD_PLAN',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  ADD_PLAN_LOG: 'ADD_PLAN_LOG'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.ADD_PLAN](state, /** @type {PlanInfo} */ payload) {
    if (state.info.findIndex(plan => plan.id === payload.id) >= 0) return;
    state.info.push(payload);
  },
  [MutationTypes.UPDATE_PLAN](state, /** @type {PlanInfo} */ payload) {
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
  [MutationTypes.ADD_PLAN_LOG](state, /** @type {PlanLog} */ payload) {
    if (state.log.findIndex(log => log.id === payload.id) >= 0) return;
    state.log.push(payload);
  }
};

export default {
  state,
  mutations
};
