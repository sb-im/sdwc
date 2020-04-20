const MapboxURL = 'https://api.mapbox.com/mapbox-gl-js/v1.9.1/mapbox-gl';

// example token from mapbox doc website
let token = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg';
let prom;
/** @type {HTMLScriptElement} */
let script;
/** @type {HTMLLinkElement} */
let style;
let styleLoaded = false;

function loadMapboxStyle() {
  style = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('href', `${MapboxURL}.css`);
  style.onload = () => styleLoaded = true;
  style.onerror = () => {
    style.onload = style.onerror = null;
    document.head.removeChild(style);
    style = null;
  };
  document.head.appendChild(style);
}

function loadMapboxScript() {
  script = document.createElement('script');
  script.setAttribute('src', `${MapboxURL}.js`);
  document.head.appendChild(script);
  return new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
  });
}

/**
 * set mapbox access token
 * @param {string} t
 */
export function setAccessToken(t) {
  if (!t) return;
  token = t;
}

/**
 * @returns {Promise<typeof mapboxgl>}
 */
export async function loadMapbox() {
  if (window.mapboxgl) {
    if (!styleLoaded && !style) {
      loadMapboxStyle();
    }
    return window.mapboxgl;
  }
  if (!prom) {
    prom = loadMapboxScript();
  }
  try {
    await prom;
    if (window.mapboxgl) {
      window.mapboxgl.accessToken = token;
      return window.mapboxgl;
    }
  } catch (e) {
    prom = null;
    throw Error('Mapbox load failed');
  }
}
