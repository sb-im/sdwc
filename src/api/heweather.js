import wretch from 'wretch';

let BaseURL = 'https://api.heweather.net';

if (__SDWC_DEV__) {
  BaseURL = 'https://devapi.heweather.net';
}

const wr = wretch(BaseURL);

const conf = {
  key: '',
  lang: '',
  unit: 'm'
};

export function setApiKey(key) {
  conf.key = key;
}

export function setLanguage(lang) {
  conf.lang = lang;
}

function get(url, lng, lat) {
  return wr.url(url)
    .query(conf)
    .query({ location: `${lng},${lat}` })
    .get()
    .json();
}

export function weather(lng, lat) {
  return get('/v7/weather/now', lng, lat);
}

export function minutely(lng, lat) {
  return get('/v7/minutely/5m', lng, lat);
}

export function warning(lng, lat) {
  return get('/v7/warning/now', lng, lat);
}
