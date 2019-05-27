import wretchJSONP from './wretch-jsonp';

const conf = {
  v: '1.4.14',
  key: ''
};
let amapProm;
let wr = wretchJSONP.url('https://webapi.amap.com/maps');

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
export async function loadAMap() {
  if (window.AMap) {
    return window.AMap;
  }
  if (!amapProm) {
    amapProm = wr.query(conf).get().res();
  }
  try {
    await amapProm;
    if (window.AMap) {
      return window.AMap;
    }
  } catch (e) {
    amapProm = null;
    throw new Error('AMap load failed.');
  }
}
