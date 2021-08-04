import wretchJSONP from './wretch-jsonp';

const baseWr = wretchJSONP.url('https://api.caiyunapp.com/v2/');

/**
 * test token
 * @see https://open.caiyunapp.com/实况天气接口
 */
let wr = baseWr.url('TAkhjf8d1nlSlspN');

export function setApiKey(key) {
  wr = baseWr.url(key);
}

/**
 * @param {string} url
 */
function request(url) {
  return wr.url(url)
    .query({ unit: 'metric:v2' })
    .get()
    .json()
    .then(res => {
      if (res.status === 'ok') return res;
      else throw res;
    });
}

/**
 * 分钟级降雨预报
 * @see https://open.caiyunapp.com/分钟级降雨预报接口
 * @param {number} lng
 * @param {number} lat
 */
export function minutely(lng, lat) {
  return request(`/${lng},${lat}/minutely`);
}
