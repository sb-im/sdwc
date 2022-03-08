// @ts-check

import { parse as parseContentDisposition } from '@tinyhttp/content-disposition';

import { setLocale, locales } from '@/i18n';
import * as S from '@/api/sdwc';
import MqttClient from '@/api/mqtt';
import * as CaiYun from '@/api/caiyun';
import * as HeWeather from '@/api/heweather';
import * as SuperDockV3 from '@/api/super-dock-v3';
import { parseWaypoints } from '@/util/waypoint-parser';

import { MutationTypes as PREF } from './modules/preference';
import { MutationTypes as CONF } from './modules/config';
import { MutationTypes as USER } from './modules/user';
import { MutationTypes as NODE } from './modules/node';
import { MutationTypes as PLAN } from './modules/plan';
import { MutationTypes as UI } from './modules/ui';


/**
 * @typedef {object} Context
 * @property {import('vuex/types/index').Commit} commit
 * @property {import('vuex/types/index').Dispatch} dispatch
 * @property {SDWC.EachReturnType<typeof import('./getters')>} getters
 * @property {SDWC.State} state
 */

/**
 * @param {Context} context
 * @param {any} payload
 */
export function setPreference({ commit }, payload) {
  if (typeof payload.lang === 'string') {
    if (Object.prototype.hasOwnProperty.call(locales, payload.lang)) {
      setLocale(payload.lang);
      HeWeather.setLanguage(payload.lang);
    } else {
      throw new Error(`Invalid language key ${payload.lang}`);
    }
  }
  commit(PREF.SET_PREFERENCE, payload);
}

/**
 * @param {Context} context
 */
export function storePreference({ state }) {
  localStorage.setItem('sdwc-preference', JSON.stringify(state.preference));
}

/**
 * @param {Context} context
 */
export function restorePreference({ commit }) {
  try {
    const pref = JSON.parse(localStorage.getItem('sdwc-preference'));
    commit(PREF.SET_PREFERENCE, pref);
  } catch (e) { /* noop */ }
}

/**
 * @param {Context} context
 */
export async function configure({ state, commit }) {
  const data = await S.config();
  document.title = data.title;
  commit(CONF.SET_CONFIG, data);
  if (!state.preference.lang) {
    commit(PREF.SET_PREFERENCE, { lang: data.lang });
  }
  const config = state.config;
  SuperDockV3.setBaseURL(config.super_dock_api_server);
  HeWeather.setApiKey(config.heweather_key);
  CaiYun.setApiKey(config.caiyun_key);
  setLocale(state.preference.lang);
}

/**
 * @param {Context} context
 */
export async function checkSingleUserMode({ state, commit, dispatch }) {
  await dispatch('getUserInfo');
  const { id, username, team_id } = state.user.info;
  if (id > 0 && username.length > 0 && team_id > 0) {
    commit(USER.SET_USER_TOKEN, { implicit: true });
    return true;
  }
  throw false;
}

/**
 * @param {Context} context
 * @param {{username: string; password: string}} payload
 */
export async function login({ commit, dispatch }, { username, password }) {
  const data = await SuperDockV3.login(username, password);
  commit(USER.SET_USER_TOKEN, data);
  SuperDockV3.setAuth(data.token);
  dispatch('initialize');
  setTimeout(() => commit(USER.INVALIDATE_TOKEN), (new Date(data.expire).getTime() - Date.now()));
}

/**
 * @param {Context} context
 */
export function logout({ commit }) {
  commit(USER.SET_USER_TOKEN, { token: '', expire: '' });
  commit(USER.SET_USER_INFO, { id: -1, username: '', teams: [], team_id: -1 });
  commit(NODE.CLEAR_NODES);
  commit(PLAN.CLEAR_PLANS);
  sessionStorage.removeItem('user');
  MqttClient.disconnect();
  SuperDockV3.setAuth('');
}

/**
 * @param {Context} context
 */
export async function getUserInfo({ commit, dispatch }) {
  const data = await SuperDockV3.getCurrentUser();
  commit(USER.SET_USER_INFO, data);
  dispatch('storeUser');
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
export async function restoreSession({ commit }) {
  const str = sessionStorage.getItem('user');
  if (!str) return;
  /** @type {SDWC.User} */
  let json;
  try { json = JSON.parse(str); } catch (e) { /* ignore it */ }
  if (json.credential.implicit) {
    // singer user mode; no token needed
  } else if (json.credential.token) {
    const timeRemaining = new Date(json.credential.expire).getTime() - Date.now();
    if (timeRemaining < 10 * 1000) return;
    SuperDockV3.setAuth(json.credential.token);
    setTimeout(() => commit(USER.INVALIDATE_TOKEN), timeRemaining);
  } else {
    return;
  }
  commit(USER.SET_USER_TOKEN, json.credential);
  commit(USER.SET_USER_INFO, json.info);
}

/**
 * establish mqtt connection
 * @param {Context} context
 */
export async function connectMqtt({ state }) {
  const mqttUrl = await SuperDockV3.createMqttUser();
  MqttClient.setRpcPrefix(state.user.info.id);
  MqttClient.connect(mqttUrl);
}

/**
 * establish mqtt connection
 * @param {Context} context
 */
export async function getSidebar({ commit }) {
  const sidebar = await SuperDockV3.getSidebar();
  commit(UI.SET_UI, { sidebar });
}

/**
 * initialize all necessary data and mqtt subs
 * @param {Context} context
 */
export async function initialize({ dispatch }) {
  dispatch('getSidebar');
  await dispatch('getUserInfo');
  await dispatch('connectMqtt');
  dispatch('getNodes').then(() => dispatch('subscribeNodes'));
  dispatch('getPlans').then(() => dispatch('subscribePlans'));
}

/**
 * @param {Context} context
 */
export async function getNodes({ commit }) {
  const data = await SuperDockV3.getNodes();
  data.sort((a, b) => a.id - b.id);
  data.forEach(node => {
    commit(NODE.ADD_NODE, node);
  });
}

/**
 * @param {Context} context
 * @param {string} id drone id
 */
export function clearDronePath({ commit }, id) {
  commit(NODE.CLEAR_NODE_PATH, id);
}

/**
 * @param {Context} context
 * @param {string} id depot id
 */
export async function updateDepotStatus({ commit }, id) {
  const status = await MqttClient.invoke(id, 'ncp', ['status']);
  commit(NODE.SET_NODE_STATUS, { id, payload: { status } });
}

const PointTopic = {
  depot_status: ['depot_status', 'notification', 'overview', 'charger'],
  drone_status: ['drone_status', 'notification', 'overview'],
  battery: ['battery'],
  weather: ['weather'],
  gimbal: ['gimbal'],
  action: ['action_enabled'],
  overlay: ['overlay_screen'],
  map: ['position', 'place', 'heatmap', 'waypoint']
};

/**
 * @param {Context} context
 */
export function subscribeNodes({ state, commit }) {
  state.node.forEach(node => {
    const id = node.info.id;
    const points = node.info.points ?? [];
    MqttClient.subscribeNode(id);
    if (points.some(p => p.point_type_name.startsWith('livestream_'))) {
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${PointTopic.gimbal}`);
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${PointTopic.action}`);
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${PointTopic.overlay}`);
    }
    points.forEach(point => {
      switch (point.point_type_name) {
        case 'custom': {
          if (typeof point.params !== 'object') break;
          const { topic = 'custom' } = point.params;
          commit(NODE.ADD_NODE_TOPIC, { id, topic });
          MqttClient.mqtt.subscribe(`nodes/${id}/msg/${topic}`);
          break;
        }
        case 'settings': {
          /** @type {SDWC.SettingsGroup[]} */
          const params = point.params;
          if (!Array.isArray(params)) break;
          params.forEach(({ topic }) => {
            commit(NODE.ADD_NODE_TOPIC, { id, topic });
            MqttClient.mqtt.subscribe(`nodes/${id}/msg/${topic}`);
          });
          break;
        }
        default: {
          /** @type {string[]} */
          const topics = PointTopic[point.point_type_name];
          if (!topics) break;
          topics.forEach(topic => {
            MqttClient.mqtt.subscribe(`nodes/${id}/msg/${topic}`);
          });
          break;
        }
      }
    });
  });
}

/**
 * @param {Context} context
 */
export async function getPlans({ commit }) {
  const data = await SuperDockV3.getTasks();
  data.forEach(plan => {
    commit(PLAN.ADD_PLAN, plan);
  });
}

/**
 * @param {Context} context
 */
export function subscribePlans({ state }) {
  state.plan.info.forEach(plan => {
    MqttClient.subscribePlan(plan.id);
  });
}

/**
 * @param {Context} context
 * @param {SDWC.PlanInfo} plan
 */
export async function createPlan({ commit }, plan) {
  const data = await SuperDock.createPlan(plan);
  if (data && typeof data.id === 'number') {
    commit(PLAN.ADD_PLAN, data);
    MqttClient.subscribePlan(data.id);
    return data;
  } else {
    throw data;
  }
}

/**
 * @param {Context} context
 * @param {SDWC.PlanInfo} plan
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
 * @param {SDWC.PlanInfo} plan
 */
export async function getPlanWaypoints(_, plan) {
  const blobId = plan.files.waypoint;
  const text = await SuperDock.downloadBlob(blobId).then(r => r.text());
  return parseWaypoints(text);
}

/**
 * @param {Context} _
 * @param {string} path file path
 * @returns {Promise<{ filename: string, blob: Blob }>}
 */
export async function downloadFile(_, path) {
  const res = await SuperDock.downloadFile(path);
  const cd = res.headers.get('content-disposition') || 'attachment';
  /** @type {Record<string, any>} */
  const { filename = '' } = parseContentDisposition(cd).parameters;
  const blob = await res.blob();
  return { filename, blob };
}

/**
 * @param {Context} _
 * @param {string} id blob id
 * @returns {Promise<{ filename: string, blob: Blob }>}
 */
export async function downloadBlob({ dispatch }, id) {
  return dispatch('downloadFile', `/api/v2/blobs/${id}`);
}

/**
 * @param {Context} _
 * @param {{ filename: string; blob: Blob  }} payload
 */
export async function saveBlobAsFile(_, { filename, blob }) {
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  Promise.resolve().then(() => {
    URL.revokeObjectURL(a.href);
    a = null;
  });
}
