// @ts-check

/** @type {SDWC.Config} */
const state = {
  beian: '',
  title: 'S Dashboard Web Console',
  aside_logo: '',
  super_dock_api_server: '',
  lang: 'en',
  ice_server: '',
  ice_servers: null,
  map_tiles_url: '',
  caiyun_key: '',
  heweather_key: '',
  mqtt_url: '',
  idle_timeout: 600
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
