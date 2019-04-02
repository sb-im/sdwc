import wretchJSONP from './wretch-jsonp';

const GoogleMapApiURL = {
  com: 'https://maps.googleapis.com/maps/api/js',
  cn: 'https://ditu.google.cn/maps/api/js',
  gdgdocs: 'https://ditu.gdgdocs.org/maps/api/js'
};

let wr = wretchJSONP.url(GoogleMapApiURL.cn);

/**
 * @param {keyof GoogleMapApiURL} url
 */
export function setBaseURL(url) {
  if (GoogleMapApiURL[url]) {
    wr = wr.url(GoogleMapApiURL[url], true);
  } else {
    wr = wr.url(url, true);
  }
}

/**
 * @param {string} key Google Map Api Key
 */
export function setApiKey(key) {
  wr = wr.query({ key }, true);
}

/**
 * @returns {Promise<google.maps>}
 */
export async function loadGoogleMap() {
  await wr.get();
  if (window.google) {
    return window.google.maps;
  }
  throw new Error('Google Map Api load failed.');
}
