// @ts-check

const state = {
  mapType: 'sd-map-amap',
  lang: ''
};

/**
 * @typedef {typeof state} State
 */

export const MutationTypes = {
  SET_PREFERENCE: 'SET_PREFERENCE'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.SET_PREFERENCE](state, /** @type {State} */ payload) {
    Object.assign(state, payload);
  }
};

export default {
  state,
  mutations
};
