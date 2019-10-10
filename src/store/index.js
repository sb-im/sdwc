import Vue from 'vue';
import Vuex from 'vuex';

import * as modules from './modules';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

/**
 * @type {import('vuex').Store<SDWC.State>}
 */
export default new Vuex.Store({
  modules,
  actions,
  getters
});
