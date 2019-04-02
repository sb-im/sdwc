import Vue from 'vue';
import Vuex from 'vuex';

import * as modules from './modules';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

/**
 * @typedef {import('./modules').State} State
 * @type {import('vuex').Store<State>}
 */
export default new Vuex.Store({
  modules,
  actions,
  getters
});
