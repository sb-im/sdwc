import { loadScript } from './load-script';

const GoogleMapApiURL = {
  com: 'https://maps.googleapis.com/maps/api/js',
  cn: 'https://ditu.google.cn/maps/api/js',
  sbim: 'https://sb.im/maps/api/js'
};

const conf = {
  url: GoogleMapApiURL.sbim,
  query: {
    key: '',
    libraries: ['visualization']
  }
};

let promise;

/**
 * @param {keyof GoogleMapApiURL} url
 */
export function setBaseURL(url) {
  conf.url = GoogleMapApiURL[url] || url;
}

/**
 * @param {string} key Google Map Api Key
 */
export function setApiKey(key) {
  conf.query.key = key;
}

/**
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 * @returns {Promise<typeof google.maps>}
 */
export async function loadGoogleMap() {
  const src = `${conf.url}?${new URLSearchParams(conf.query).toString()}`;
  promise = loadScript(src, 'google');
  const google = await promise;
  return google.maps;
}

export async function loadGoogleMapMarker() {
  /* global require:readonly */
  if (promise) await promise;
  if (window.google) {
    return require('@google/markerwithlabel');
  }
}
