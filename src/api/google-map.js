import wretchJSONP from './wretch-jsonp';

const GoogleMapApiURL = {
  com: 'https://maps.googleapis.com/maps/api/js',
  cn: 'https://ditu.google.cn/maps/api/js',
  gdgdocs: 'https://ditu.gdgdocs.org/maps/api/js'
};

let gmapProm;
let wr = wretchJSONP.url(GoogleMapApiURL.com);

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
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 * @returns {Promise<typeof google.maps>}
 */
export async function loadGoogleMap() {
  if (window.google) {
    return window.google.maps;
  }
  if (!gmapProm) {
    gmapProm = wr.get().res();
  }
  try {
    await gmapProm;
    if (window.google) {
      return window.google.maps;
    }
  } catch (e) {
    gmapProm = null;
    throw Error('Google Map load failed.');
  }
}

export async function loadGoogleMapMarker() {
  /* global require:readonly */
  if (window.google) {
    return require('@google/markerwithlabel');
  }
  try {
    await gmapProm;
    if (window.google) {
      return require('@google/markerwithlabel');
    }
  } catch (e) {
    throw Error('Google Map Marker load failed.');
  }
}
