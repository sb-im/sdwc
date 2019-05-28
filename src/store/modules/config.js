// @ts-check

const state = {
  super_dock_api_server: '',
  oauth_client_id: '',
  oauth_client_secret: '',
  lang: 'en',
  amap_key: '',
  gmap_key: '',
  caiyun_key: '',
  mqtt_url: '',
};

/**
 * @typedef {typeof state} State
 */

export const MutationTypes = {
  SET_CONFIG: 'SET_CONFIG'
};

/**
 * @type {{ [x: string]: (state: State, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.SET_CONFIG](state, /** @type {State} */ payload) {
    Object.assign(state, payload);
  }
};

export default {
  state,
  mutations
};
