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
import { MutationTypes as SCHE } from './modules/schedule';
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
  commit(CONF.SET_CONFIG, data);
  const config = state.config;
  if (!state.preference.lang) {
    commit(PREF.SET_PREFERENCE, { lang: config.lang });
  }
  document.title = config.title;
  SuperDockV3.setBaseURL(config.super_dock_api_server);
  HeWeather.setApiKey(config.heweather_key);
  CaiYun.setApiKey(config.caiyun_key);
  setLocale(state.preference.lang);
}

/**
 * @param {Context} context
 */
export async function checkSingleUserMode({ state, commit, dispatch }) {
  try {
    await dispatch('getUserInfo');
    const { id, username, team_id } = state.user.info;
    if (id > 0 && username.length > 0 && team_id > 0) {
      commit(USER.SET_USER_TOKEN, { implicit: true });
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
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
}

/**
 * @param {Context} context
 */
export async function refreshToken({ commit }) {
  const data = await SuperDockV3.refershToken();
  commit(USER.SET_USER_TOKEN, data);
  SuperDockV3.setAuth(data.token);
}

/**
 * @param {Context} context
 */
export async function handleTokenExpire({ state, commit, dispatch }) {
  if (!state.ui.idle) {
    try {
      await dispatch('refreshToken');
      await dispatch('setupTokenExpireTimer');
      return;
    } catch (e) {
      // ignore
    }
  }
  dispatch('logout');
  commit(USER.INVALIDATE_TOKEN);
}

/**
 * @param {Context} context
 * @param {number} timeout
 */
export function setupTokenExpireTimer({ state, commit, dispatch }, timeout) {
  const oldTimer = state.ui.expireTimer;
  if (oldTimer > 0) {
    clearTimeout(oldTimer);
  }
  const t = timeout ?? new Date(state.user.credential.expire).getTime() - Date.now();
  const timer = setTimeout(() => dispatch('handleTokenExpire'), t);
  commit(UI.SET_UI, { expireTimer: timer });
}

/**
 * @param {Context} context
 */
export async function handleUserIdle({ state, getters, commit, dispatch }) {
  commit(UI.SET_UI, { idle: true });
  const oldTimer = state.ui.expireTimer;
  if (oldTimer > 0) {
    clearTimeout(oldTimer);
    commit(UI.SET_UI, { expireTimer: -1 });
  }
  if (!getters.authenticated) {
    return;
  }
  dispatch('logout');
  commit(USER.INVALIDATE_TOKEN);
}

/**
 * @param {Context} context
 */
export function logout({ commit }) {
  commit(USER.SET_USER_TOKEN, { token: '', expire: '' });
  commit(USER.SET_USER_INFO, { id: -1, username: '', teams: [], team_id: -1 });
  commit(NODE.CLEAR_NODES);
  commit(PLAN.CLEAR_PLANS);
  commit(SCHE.CLEAR_SCHEDULES);
  commit(UI.SET_UI, { sidebar: [] });
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
 * @param {number} id
 */
export async function switchTeam({ commit, dispatch }, id) {
  const data = await SuperDockV3.switchTeam(id);
  await dispatch('logout');
  commit(USER.SET_USER_TOKEN, data);
  SuperDockV3.setAuth(data.token);
  dispatch('initialize');
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
  try { json = JSON.parse(str); } catch (e) { return; }
  if (json.credential.implicit) {
    // singer user mode; no token needed
  } else if (json.credential.token) {
    const timeRemaining = new Date(json.credential.expire).getTime() - Date.now();
    if (timeRemaining < 10 * 1000) return;
    SuperDockV3.setAuth(json.credential.token);
  }
  commit(USER.SET_USER_TOKEN, json.credential);
  commit(USER.SET_USER_INFO, json.info);
}

/**
 * establish mqtt connection
 * @param {Context} context
 */
export async function connectMqtt({ state }) {
  let mqttUrl = await SuperDockV3.createMqttUser();
  mqttUrl = mqttUrl.replace(/^mqtt/, 'ws');
  const overrideUrl = state.config.mqtt_url;
  if (typeof overrideUrl === 'string' && overrideUrl.length > 0) {
    const url = new URL(mqttUrl);
    try {
      const override = new URL(overrideUrl);
      ['protocol', 'username', 'password', 'host', 'pathname', 'search'].forEach(k => {
        if (override[k]) url[k] = override[k];
      });
      mqttUrl = url.toString();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[sdwc] Invalid `mqtt_url` override in config.json');
    }
  }
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
export async function initialize({ state, dispatch }) {
  if (!state.user.credential.implicit) {
    dispatch('setupTokenExpireTimer');
  }
  dispatch('getSidebar');
  await dispatch('getUserInfo');
  await dispatch('connectMqtt');
  dispatch('getNodes').then(() => dispatch('subscribeNodes'));
  dispatch('getPlans').then(() => dispatch('subscribePlans'));
  dispatch('getSchedules');
}

/**
 * @param {Context} context
 */
export async function getNodes({ commit }) {
  const data = await SuperDockV3.getNodes();
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
    if (points.some(p => p.type.startsWith('livestream_'))) {
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${PointTopic.gimbal}`);
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${PointTopic.action}`);
      MqttClient.mqtt.subscribe(`nodes/${id}/msg/${PointTopic.overlay}`);
    }
    points.forEach(point => {
      switch (point.type) {
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
          const topics = PointTopic[point.type];
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
  state.plan.forEach(plan => {
    MqttClient.subscribePlan(plan.info.id);
  });
}

/**
 * @param {Context} context
 * @param {SDWC.PlanInfo} plan
 */
export async function createPlan({ commit }, plan) {
  const data = await SuperDockV3.createTask(plan);
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
  const data = await SuperDockV3.updateTask(plan.id, plan);
  commit(PLAN.UPDATE_PLAN, data);
  return data;
}

/**
 * @param {Context} context
 * @param {number} id
 */
export async function deletePlan({ commit }, id) {
  await SuperDockV3.deleteTask(id);
  commit(PLAN.DELETE_PLAN, id);
}

/**
 * @param {Context} _
 * @param {SDWC.PlanInfo} plan
 */
export async function getPlanWaypoints(_, plan) {
  const blobId = plan.files.waypoint;
  if (!blobId) throw new Error('no waypoint in plan');
  const buf = await SuperDockV3.getBlob(blobId).then(r => r.arrayBuffer());
  return parseWaypoints(buf);
}

/**
 * @param {Context} context
 * @param {{ id: number, size?: number, page?: number }} payload
 * @returns {Promise<SDWC.PlanJob[]>}
 */
export async function getTaskJobs({ commit }, { id, size = 10, page = 1 }) {
  const data = await SuperDockV3.getTaskDetail(id, page, size);
  const jobs = data.jobs ?? [];
  delete data.jobs;
  commit(PLAN.UPDATE_PLAN, data);
  return jobs;
}

/**
 * @param {Context} context
 */
export async function getSchedules({ commit }) {
  const data = await SuperDockV3.getSchedules();
  data.forEach(schedule => {
    commit(SCHE.ADD_SCHEDULE, schedule);
  });
}

/**
 * @param {Context} context
 * @param {ApiTypes.V3.Schedule} schedule
 */
 export async function updateSchedule({ commit }, schedule) {
  const data = await SuperDockV3.updateSchedule(schedule.id, schedule);
  commit(SCHE.UPDATE_SCHEDULE, data);
  return data;
}

/**
 * @param {Context} context
 * @param {number} id
 */
export async function deleteSchedule({ commit }, id) {
  await SuperDockV3.deleteSchedule(id);
  commit(SCHE.DELETE_SCHEDULE, id);
}

/**
 * @param {Context} _
 * @param {string} id blob id
 * @returns {Promise<{ filename: string, blob: Blob }>}
 */
export async function downloadBlob(_, id) {
  const res = await SuperDockV3.getBlob(id);
  const cd = res.headers.get('content-disposition') || 'attachment';
  /** @type {Record<string, any>} */
  const { filename = '' } = parseContentDisposition(cd).parameters;
  const blob = await res.blob();
  return { filename, blob };
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
