const Mapbox = {
  js: null,
  style: null
};

export function loadMapbox() {
  if (!Mapbox.style) {
    Mapbox.style = import(/* webpackChunkName: 'mapbox-gl-style' */ 'mapbox-gl/dist/mapbox-gl.css');
  }
  if (!Mapbox.js) {
    Mapbox.js = import(/* webpackChunkName: 'mapbox-gl' */ 'mapbox-gl');
  }
  return Mapbox.js;
}
