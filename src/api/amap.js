import wretchJSONP from './wretch-jsonp';

const conf = {
  v: '1.4.15',
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

function amapUiJsonp() {
  return new Promise((resolve, reject) => {
    const uiScript = document.createElement('script');
    uiScript.setAttribute('src', 'https://webapi.amap.com/ui/1.0/main-async.js');
    uiScript.addEventListener('load', () => {
      if (typeof window['initAMapUI'] === 'function') {
        try {
          window['initAMapUI'].call();
          resolve(window.AMapUI);
          document.head.removeChild(uiScript);
        } catch (e) {
          reject(e);
        }
      } else {
        reject();
      }
    });
    uiScript.addEventListener('error', reject);
    document.head.appendChild(uiScript);
  });
}

let amapUiProm = null;

/**
 * @see https://lbs.amap.com/api/javascript-api/guide/amap-ui/intro
 */
export async function loadAMapUI() {
  if (window.AMapUI) {
    return window.AMapUI;
  }
  if (!amapUiProm) {
    amapUiProm = amapUiJsonp();
  }
  try {
    await amapUiProm;
    if (window.AMapUI) {
      return window.AMapUI;
    }
  } catch (e) {
    amapUiProm = null;
    throw new Error('AMap load failed.');
  }
}
