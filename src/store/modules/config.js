// @ts-check

/** @type {SDWC.Config} */
const state = {
  beian: '',
  aside_logo: '',
  super_dock_api_server: '',
  oauth_client_id: '',
  oauth_client_secret: '',
  lang: 'en',
  amap_key: '',
  gmap_key: '',
  map_tiles_url: '',
  heweather_key: '',
  mapbox_key: '',
  mqtt_url: '',
};

export const MutationTypes = {
  SET_CONFIG: 'SET_CONFIG'
};

/**
 * @type {{ [x: string]: (state: SDWC.Config, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.SET_CONFIG](state, /** @type {Partial<SDWC.Config>} */ payload) {
    Object.assign(state, payload);
  }
};

export default {
  state,
  mutations
};
