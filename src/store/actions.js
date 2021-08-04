// @ts-check

import { parse as parseContentDisposition } from '@tinyhttp/content-disposition';

import { setLocale, locales } from '@/i18n';
import * as S from '@/api/sdwc';
import * as AMap from '@/api/amap';
import MqttClient from '@/api/mqtt';
import * as Mapbox from '@/api/mapbox';
import * as CaiYun from '@/api/caiyun';
import * as HeWeather from '@/api/heweather';
import * as SuperDock from '@/api/super-dock';
import * as GoogleMap from '@/api/google-map';
import { parseWaypoints } from '@/util/waypoint-parser';

import { MutationTypes as PREF } from './modules/preference';
import { MutationTypes as CONF } from './modules/config';
import { MutationTypes as USER } from './modules/user';
import { MutationTypes as NODE } from './modules/node';
import { MutationTypes as PLAN } from './modules/plan';

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
  commit(CONF.SET_CONFIG, data);
  if (!state.preference.lang) {
    commit(PREF.SET_PREFERENCE, { lang: data.lang });
  }
  const config = state.config;
  SuperDock.setBaseURL(config.super_dock_api_server);
  GoogleMap.setApiKey(config.gmap_key);
  HeWeather.setApiKey(config.heweather_key);
  Mapbox.setAccessToken(config.mapbox_key);
  CaiYun.setApiKey(config.caiyun_key);
  AMap.setApiKey(config.amap_key);
  setLocale(state.preference.lang);
}

/**
 * @param {Context} context
 * @param {{username: string; password: string}} payload
 */
export async function login({ state, commit }, { username, password }) {
  const data = await SuperDock.token(username, password, state.config.oauth_client_id, state.config.oauth_client_secret);
  const token = `${data.token_type} ${data.access_token}`;
  const due = (data.created_at + data.expires_in) * 1000;
  commit(USER.SET_USER_TOKEN, { token, due });
  SuperDock.setAuth(token);
  setTimeout(() => commit(USER.INVALIDATE_TOKEN), data.expires_in * 1000);
  return token;
}

/**
 * @param {Context} context
 */
export function logout({ state, commit }) {
  commit(USER.SET_USER_TOKEN, { token: '', due: -1 });
  commit(USER.SET_USER_INFO, { email: '', id: -1 });
  commit(NODE.CLEAR_NODES);
  commit(PLAN.CLEAR_PLANS);
  sessionStorage.removeItem('user');
  MqttClient.disconnect();
  SuperDock.logout(state.user.token.slice(7))
    .catch(() => { /* noop */ })
    .then(() => SuperDock.setAuth(''));
}

/**
 * @param {Context} context
 */
export async function getUserInfo({ commit, dispatch }) {
  const data = await SuperDock.user();
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
  if (!json.token) return;
  commit(USER.SET_USER_TOKEN, json);
  commit(USER.SET_USER_INFO, json);
  SuperDock.setAuth(json.token);
  setTimeout(() => commit(USER.INVALIDATE_TOKEN), json.due - Date.now());
}

/**
 * initialize and establish mqtt connection
 * @param {Context} context
 */
export function initializeMqtt({ state }) {
  MqttClient.setRpcPrefix(state.user.id);
  MqttClient.connect(state.config.mqtt_url);
}

/**
 * @param {Context} context
 */
export async function getNodes({ commit }) {
  const data = await SuperDock.nodes();
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

const NodePointTopic = {
  depot_status: ['depot_status', 'notification', 'overview', 'charger'],
  drone_status: ['drone_status', 'notification', 'overview'],
  battery: 'battery',
  weather: 'weather',
  gimbal: 'gimbal',
  action: 'action_enabled',
  overlay: 'overlay_screen',
  map: ['position', 'place', 'heatmap', 'waypoint']
};

/**
 * @param {Context} context
 */
export function subscribeNodes({ state, commit }) {
  state.node.forEach(node => {
    const { id, points } = node.info;
    MqttClient.subscribeNode(id);
    if (points.some(p => p.point_type_name.startsWith('livestream_'))) {
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${NodePointTopic.gimbal}`);
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${NodePointTopic.action}`);
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${NodePointTopic.overlay}`);
    }
    for (const point of points) {
      if (point.point_type_name === 'custom') {
        if (!point.params || typeof point.params !== 'object') continue;
        const { topic = 'custom' } = point.params;
        commit(NODE.ADD_NODE_TOPIC, { id, topic });
        MqttClient.mqtt.subscribe(`nodes/${id}/msg/${topic}`);
        continue;
      } else if (point.point_type_name === 'settings') {
        if (!point.params || typeof point.params !== 'object') continue;
        point.params.forEach(group => {
          const topic = group.topic;
          commit(NODE.ADD_NODE_TOPIC, { id, topic: group.topic });
          MqttClient.mqtt.subscribe(`nodes/${id}/msg/${topic}`);
        });
      }
      const t = NodePointTopic[point.point_type_name];
      if (!t) continue;
      const topics = Array.isArray(t) ? t : [t];
      for (const topic of topics) {
        MqttClient.mqtt.subscribe(`nodes/${id}/msg/${topic}`);
      }
    }
  });
}

/**
 * @param {Context} context
 */
export async function getPlans({ commit }) {
  const data = await SuperDock.plans();
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
  const { filename } = parseContentDisposition(cd).parameters;
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
