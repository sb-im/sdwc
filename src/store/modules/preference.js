// @ts-check

/** @type {SDWC.Preference} */
const state = {
  lang: '',
  mapType: 'sd-map-mapbox',
  mapFollow: true,
  overviewFit: true,
  notifyNoPopup: [],
  rpcMsgPopup: false,
  planDialogPopup: true
};

export const MutationTypes = {
  SET_PREFERENCE: 'SET_PREFERENCE'
};

/**
 * @type {{ [x: string]: (state: SDWC.Preference, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.SET_PREFERENCE](state, /** @type {Partial<SDWC.Preference>} */ payload) {
    for (const [key, value] of Object.entries(payload)) {
      if (Object.prototype.hasOwnProperty.call(state, key)) {
        state[key] = value;
      }
    }
  }
};

export default {
  state,
  mutations
};
