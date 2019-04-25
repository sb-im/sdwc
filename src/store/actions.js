// @ts-check

import { setLocale } from '../i18n';

import * as SuperDock from '../api/super-dock';
// import * as Weather3s from '../api/weather3s';
import * as GoogleMap from '../api/google-map';
import * as CaiYun from '../api/caiyun';
import * as SDWC from '../api/sdwc';
import MqttClient from '../api/mqtt';
import ContentDisposition from 'content-disposition';

import { MutationTypes as CONFIG } from './modules/config';
import { MutationTypes as USER } from './modules/user';
import { MutationTypes as NODE } from './modules/node';
import { MutationTypes as PLAN } from './modules/plan';

/**
 * @typedef {object} Context
 * @property {import('vuex/types/index').Commit} commit
 * @property {import('vuex/types/index').Dispatch} dispatch
 * @property {import('./getters').Getters} getters
 * @property {import('./index').State} state
 */

/**
 * @param {Context} context
 */
export async function configure({ state, commit }) {
  const data = await SDWC.config();
  commit(CONFIG.SET_CONFIG, data);
  const config = state.config;
  SuperDock.setBaseURL(config.super_dock_api_server);
  GoogleMap.setApiKey(config.gmap_key);
  CaiYun.setApiKey(config.caiyun_key);
  setLocale(config.lang);
}

/**
 * @param {Context} context
 * @param {{username: string; password: string}} payload
 */
export async function login({ state, commit }, { username, password }) {
  try {
    const data = await SuperDock.token(username, password, state.config.oauth_client_id, state.config.oauth_client_secret);
    const token = `${data.token_type} ${data.access_token}`;
    const due = (data.created_at + data.expires_in) * 1000;
    commit(USER.SET_USER_TOKEN, { token, due });
    SuperDock.setAuth(token);
    return token;
  }
  catch (e) {
    throw { msg: e.invalid_grant };
  }
}

/**
 * @param {Context} context
 */
export async function getUserInfo({ commit, dispatch }) {
  const data = await SuperDock.user();
  commit(USER.SET_USER_INFO, data);
  dispatch('storeUser');
  MqttClient.setIdPrefix(data.id);
}

/**
 * @param {Context} context
 */
export function storeUser({ state }) {
  sessionStorage.setItem('user', JSON.stringify(state.user));
}

/**
 * restore user session after page refresh, if token still valid
 * @param {Context} context
 */
export async function reconfigure({ commit }) {
  const str = sessionStorage.getItem('user');
  if (!str) return;
  /** @type {import('./modules/user').State} */
  let json;
  try { json = JSON.parse(str); } catch (e) { /* ignore it */ }
  if (!json.token) return;
  commit(USER.SET_USER_TOKEN, json);
  commit(USER.SET_USER_INFO, json);
  SuperDock.setAuth(json.token);
}

/**
 * @param {Context} context
 */
export async function getNodes({ commit }) {
  const data = await SuperDock.nodes();
  data.forEach(node => {
    commit(NODE.ADD_NODE, node);
  });
}

/**
 * @param {Context} context
 */
export async function subscribeNodes({ state, commit }) {
  MqttClient.connect(state.config.mqtt_url);
  state.node.info.forEach(node => {
    MqttClient.subscribeNode(node.id);
  });
  MqttClient.on('status', ({ id, status }) => {
    commit(NODE.SET_NODE_STATUS, { id, status });
  });
  MqttClient.on('message', ({ id, message }) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
      commit(NODE.ADD_NODE_MSG, { id, msg: parsed });
    } catch (e) {
      commit(NODE.ADD_NODE_LOG, { id, log: message });
    }
  });
}

/**
 * @param {Context} context
 */
export async function getPlans({ commit }) {
  const data = await SuperDock.plans();
  data.forEach(node => {
    commit(PLAN.ADD_PLAN, node);
  });
}

/**
 * @param {Context} context
 * @param {number} id
 */
export async function getPlanLogs({ commit }, id) {
  const data = await SuperDock.planLogs(id);
  data.forEach(log => {
    commit(PLAN.ADD_PLAN_LOG, log);
  });
}

/**
 * @typedef {import('./modules/plan').PlanInfo} Plan
 * @param {Context} context
 * @param {Plan} plan
 */
export async function createPlan({ commit }, plan) {
  const data = await SuperDock.createPlan(plan);
  commit(PLAN.ADD_PLAN, data);
  return data;
}

/**
 * @param {Context} context
 * @param {number} id
 */
export async function retrievePlan({ commit }, id) {
  const data = await SuperDock.retrievePlan(id);
  commit(PLAN.UPDATE_PLAN, data);
  return data;
}

/**
 * @param {Context} context
 * @param {Plan} plan
 */
export async function updatePlan({ commit }, plan) {
  const data = await SuperDock.updatePlan(plan.id, plan);
  commit(PLAN.UPDATE_PLAN, data);
  return data;
}

/**
 * @param {Context} context
 * @param {number} id
 */
export async function deletePlan({ commit }, id) {
  await SuperDock.deletePlan(id);
  commit(PLAN.DELETE_PLAN, id);
}

/**
 * @param {Context} _
 * @param {{url: string, name: string}} url
 */
export async function downloadFile(_, { url, name }) {
  const res = await SuperDock.getFile(url);
  const cd = res.headers.get('content-disposition');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  if (typeof cd === 'string') {
    a.download = ContentDisposition.parse(cd).parameters.filename;
  } else {
    a.download = name;
  }
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  Promise.resolve().then(() => {
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  });
}
