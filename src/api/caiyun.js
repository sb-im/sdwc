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
 * 实况天气
 * @see https://open.caiyunapp.com/实况天气接口/v2.2
 * @param lng
 * @param lat
 */
export function realtime(lng, lat) {
  return wr.url(`/${lng},${lat}/realtime`)
    .get()
    .json();
}

/**
 * 分钟级降雨预报
 * @see https://open.caiyunapp.com/分钟级降雨预报接口
 * @param lng
 * @param lat
 */
export function minutely(lng, lat) {
  return wr.url(`/${lng},${lat}/forecast`)
    .get()
    .json();
}
