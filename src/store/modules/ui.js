// @ts-check

/**
 * @type {SDWC.UI}
 */
const state = {
  mqttConnected: false,
  mqttDelay: -1
};

export const MutationTypes = {
  SET_UI: 'SET_UI'
};

/**
 * @type {{ [x: string]: (state: SDWC.UI, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.SET_UI](state, /** @type {Partial<SDWC.UI>} */ payload) {
    Object.assign(state, payload);
  }
};

export default {
  state,
  mutations
};
