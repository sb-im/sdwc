// @ts-check

/** @type {SDWC.User} */
const state = {
  info: {
    id: -1,
    language: '',
    team_id: -1,
    teams: [],
    timezone: '',
    username: '',
    created_at: '',
    updated_at: ''
  },
  credential: {
    implicit: false,
    token: '',
    expire: ''
  }
};

export const MutationTypes = {
  SET_USER_TOKEN: 'SET_USER_TOKEN',
  SET_USER_INFO: 'SET_USER_INFO',
  INVALIDATE_TOKEN: 'INVALIDATE_TOKEN'
};

/**
 * @type {{ [x: string]: (state: SDWC.User, payload: any) => void }}
 */
const mutations = {
  [MutationTypes.SET_USER_TOKEN](state, payload) {
    state.credential = payload;
  },
  [MutationTypes.SET_USER_INFO](state, payload) {
    state.info = payload;
  },
  [MutationTypes.INVALIDATE_TOKEN](state) {
    state.credential = {
      implicit: false,
      token: '',
      expire: ''
    };
  }
};

export default {
  state,
  mutations
};
