import { h } from '@/util/create-element';

import { loadScript } from './load-script';

const MapboxURL = 'https://api.mapbox.com/mapbox-gl-js/v1.9.1/mapbox-gl';

// example token from mapbox doc website
const conf = {
  token: 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg'
};

/** @type {HTMLLinkElement} */
let style;
let styleLoaded = false;

function loadMapboxStyle() {
  style = h('link', { rel: 'stylesheet', href: `${MapboxURL}.css` });
  style.onload = () => styleLoaded = true;
  style.onerror = () => {
    style.onload = style.onerror = null;
    document.head.removeChild(style);
    style = null;
  };
  document.head.appendChild(style);
}

/**
 * set mapbox access token
 * @param {string} t
 */
export function setAccessToken(t) {
  if (!t) return;
  conf.token = t;
}

/**
 * @returns {Promise<typeof mapboxgl>}
 */
export function loadMapbox() {
  if (!styleLoaded && !style) {
    loadMapboxStyle();
  }
  return loadScript(`${MapboxURL}.js`, 'mapboxgl', mapboxgl => {
    mapboxgl.accessToken = conf.token;
  });
}
