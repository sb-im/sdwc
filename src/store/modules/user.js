// @ts-check

/** @type {SDWC.User} */
const state = {
  id: -1,
  email: '',
  token: '',
  due: -1
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
  [MutationTypes.SET_USER_TOKEN](state, { token, due }) {
    state.token = token;
    state.due = due;
  },
  [MutationTypes.SET_USER_INFO](state, { id, email }) {
    state.id = id;
    state.email = email;
  },
  [MutationTypes.INVALIDATE_TOKEN](state) {
    state.token = '';
    state.due = -1;
  }
};

export default {
  state,
  mutations
};
