import { loadScript } from './load-script';

const AMapURL = 'https://webapi.amap.com';

const conf = {
  v: '1.4.15',
  key: ''
};

/**
 * @param {string} key amap api key
 */
export function setApiKey(key) {
  conf.key = key;
}

/**
 * @see https://lbs.amap.com/api/javascript-api/reference/core
 * @returns {Promise<typeof AMap>}
 */
export function loadAMap() {
  const qs = new URLSearchParams(conf).toString();
  return loadScript(`${AMapURL}/maps?${qs}`, 'AMap');
}

/**
 * @see https://lbs.amap.com/api/javascript-api/guide/amap-ui/intro
 */
export function loadAMapUI() {
  return loadScript(`${AMapURL}/ui/1.0/main-async.js`, 'AMapUI', 'initAMapUI');
}
