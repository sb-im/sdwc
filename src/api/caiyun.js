import wretchJSONP from './wretch-jsonp';

const baseWr = wretchJSONP.url('https://api.caiyunapp.com/v2/');

/**
 * test token
 * @see https://open.caiyunapp.com/实况天气接口/v2.2
 */
let wr = baseWr.url('TAkhjf8d1nlSlspN');

export function setApiKey(key) {
  wr = baseWr.url(key);
}

/**
 * @param {string} url
 */
function get(url) {
  return wr.url(url)
    .get()
    .json()
    .then(res => {
      if (res.status === 'ok') return res;
      else throw res;
    });
}

/**
 * 实况天气
 * @see https://open.caiyunapp.com/实况天气接口/v2.2
 * @param {number} lng
 * @param {number} lat
 * @returns {import('./api-types').CaiYunRealtime}
 */
export function realtime(lng, lat) {
  return get(`/${lng},${lat}/realtime`);
}

/**
 * 分钟级降雨预报
 * @see https://open.caiyunapp.com/分钟级降雨预报接口
 * @param {number} lng
 * @param {number} lat
 * @returns {import('./api-types').CaiYunMinutely}
 */
export function minutely(lng, lat) {
  return get(`/${lng},${lat}/minutely`);
}
