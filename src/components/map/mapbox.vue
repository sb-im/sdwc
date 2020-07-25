<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadMapbox } from '@/api/mapbox';
import { h, hs } from '@/util/create-element';
import { waitSelector } from '@/util/wait-selector';

import { randColor } from './common';

/**
 * @typedef {{ lng: number, lat: number }} LngLatLiteral
 * @typedef {{ data: GeoJSON.LineString, source: string, layers: string[] }} PathDescriptor
 */

/** @type {number} */
let __MAPBOX_ZOOM__;

/** @type {mapboxgl.LngLat} */
let __MAPBOX_CENTER__;

/** @type {mapboxgl.Style} */
const GoogleRasterStyle = {
  version: 8,
  sources: {
    google: {
      type: 'raster',
      tileSize: 256,
      tiles: ['https://mt1.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}']
    }
  },
  layers: [{ id: 'GoogleRasterLayer', type: 'raster', source: 'google' }]
};

const Path = {
  Source: 'PathSource',
  Layer: 'PathLayer',
  OutlineLayer: 'PathOutlineLayer',
  /** @type {mapboxgl.LineLayout} */
  Layout: { 'line-cap': 'round', 'line-join': 'round' }
};

/** @type {{ [key: string]: { layout: mapboxgl.LineLayout, outline: mapboxgl.LinePaint, paint: mapboxgl.LinePaint } }} */
const PlacePathStyle = {
  solid: {
    layout: Path.Layout,
    paint: { 'line-width': 2 },
    outline: { 'line-width': 2, 'line-gap-width': 1, 'line-color': '#fff' }
  },
  dotted: {
    layout: Path.Layout,
    paint: { 'line-dasharray': [0, 3], 'line-width': 3 },
    outline: { 'line-dasharray': [0, 1.8], 'line-width': 5, 'line-color': '#fff' }
  },
  dashed: {
    layout: { 'line-cap': 'butt' },
    paint: { 'line-dasharray': [3, 1], 'line-width': 3 },
    outline: { 'line-dasharray': [1.8, 0.6], 'line-width': 5, 'line-color': '#fff' }
  },
};

const Heatmap = {
  Layer: 'HeatmapLayer',
  Source: 'HeatmapSource'
};

function createMarkerElement(label = '', color = '#ea4335') {
  return h('div', { class: 'mapbox-marker', style: 'width:29px;height:37px' }, [
    hs('svg', { width: 29, height: 37 }, [
      hs('path', {
        fill: color,
        stroke: '#fff',
        d: 'M28 14.5c0 5.5-7 13.5-12.25 21-.75 1-1.75 1-2.5 0C7.75 28 1 20 1 14.5 1 7 7 1 14.5 1S28 7 28 14.5z'
      })
    ]),
    label ? h('div', { class: 'mapbox-marker__label', style: `background:${color}` }, label) : null
  ]);
}

function createDroneElement(label = '', color = '#ea4335') {
  return h('div', { class: 'mapbox-marker mapbox-marker--drone', style: 'width:34px;height:34px' }, [
    hs('svg', { width: 34, height: 34 }, [
      hs('path', {
        fill: color,
        stroke: '#fff',
        d: 'M17 1L5 32.5 17 27l12 5.5z'
      })
    ]),
    label ? h('div', { class: 'mapbox-marker__label', style: `background:${color}` }, label) : null
  ]);
}

function createPointElement(action = '') {
  return h('div', { class: 'mapbox-marker--action' }, action);
}

export default {
  name: 'sd-map-mapbox',
  props: {
    /** @type {Vue.PropOptions<LngLatLiteral[]>} */
    path: {
      type: Array,
      default: () => []
    },
    /** @type {Vue.PropOptions<SDWC.Marker[]>} */
    markers: {
      type: Array,
      default: () => []
    },
    places: {
      type: Array,
      default: () => []
    },
    /** @type {Vue.PropOptions<SDWC.GPSHeatPoint[]>} */
    heatmap: {
      type: Array,
      default: () => []
    },
    fit: {
      type: Boolean,
      default: false
    },
    follow: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    pathColor: {
      type: String,
      default: '#ea4335'
    },
    popoverShown: {
      type: Boolean,
      default: false
    },
    markerStyling: {
      type: Object,
      required: false
    }
  },
  methods: {
    async initMap() {
      const { Map, ScaleControl, NavigationControl } = await loadMapbox();
      const map = new Map({
        container: this.$refs.map,
        style: GoogleRasterStyle,
        maxZoom: 19,
        zoom: __MAPBOX_ZOOM__ || 0.5,
        center: __MAPBOX_CENTER__ || { lat: 27, lng: 162 },
      });
      map.addControl(new ScaleControl(), 'bottom-left');
      map.addControl(new NavigationControl(), 'bottom-right');
      map.on('wheel', () => this.$emit('map-move'));
      map.on('dragstart', () => this.$emit('map-move'));
      this.map = map;
      if (this.selectable) {
        this.bindMapEvents();
      }
      return new Promise((resolve, reject) => {
        map.once('load', resolve);
        map.once('error', reject);
      });
    },
    async bindMapEvents() {
      /** @type {mapboxgl.Map} */
      const map = this.map;
      map.on('movestart', () => this.$emit('cancel-point'));
      map.on('zoomstart', () => this.$emit('cancel-point'));
      const { Marker } = await loadMapbox();
      /** @type { (position: mapboxgl.LngLat) => void } */
      const placeMarker = position => {
        if (this.selectedMarker) {
          this.selectedMarker.addTo(map);
          this.selectedMarker.setLngLat(position);
        } else {
          const element = createMarkerElement('', '#409eff');
          element.classList.add('mapbox-marker--selected');
          this.selectedMarker = new Marker({ element, anchor: 'bottom' })
            .setLngLat(position)
            .addTo(map);
        }
        waitSelector(this.$refs.map, 'div.mapbox-marker--selected').then(el => {
          const { lng, lat } = position;
          this.$emit('select-point', { lng, lat }, el);
        });
      };
      map.on('contextmenu', e => placeMarker(e.lngLat));
      // touch screen long press
      let touchContinue = false;
      map.on('touchstart', e => {
        touchContinue = true;
        setTimeout(() => touchContinue && placeMarker(e.lngLat), 500);
      });
      map.on('touchend', () => touchContinue = false);
      map.on('touchmove', () => touchContinue = false);
    },
    removeSeletedMarker() {
      if (!this.selectedMarker) return;
      this.selectedMarker.remove();
    },
    async drawPath() {
      const coordinates = this.path.map(p => [p.lng, p.lat]);
      /** @type {mapboxgl.Map} */
      const map = this.map;
      /** @type {GeoJSON.LineString} */
      const pathData = { type: 'LineString', coordinates };
      if (this.pathData) {
        map.getSource(Path.Source).setData(pathData);
      } else {
        map.addSource(Path.Source, { type: 'geojson', data: pathData });
        map.addLayer({
          id: Path.OutlineLayer,
          type: 'line',
          source: Path.Source,
          layout: Path.Layout,
          paint: { 'line-color': '#fff', 'line-width': 4, }
        });
        map.addLayer({
          id: Path.Layer,
          type: 'line',
          source: Path.Source,
          layout: Path.Layout,
          paint: { 'line-color': this.pathColor, 'line-width': 2 }
        });
      }
      this.pathData = pathData;
      if (this.fit) {
        this.fitPath();
      } else if (this.follow && !this.popoverShown) {
        map.setCenter(coordinates[0]);
      }
    },
    /**
     * @param {string} name
     * @param {mapboxgl.LngLat[]} points
     * @param {SDWC.DroneMapStyling} style
     */
    drawAnimatedPath(name, points, style) {
      const coordinates = points.map(p => [p.lng, p.lat]);
      /** @type {GeoJSON.Feature<GeoJSON.LineString>} */
      const data = { type: 'LineString', coordinates };
      /** @type {mapboxgl.Map} */
      const map = this.map;
      /** @type {PathDescriptor} */
      let pd = this.placePaths[name];
      if (pd) {
        pd.data = data;
        map.getSource(pd.source).setData(data);
        return;
      } else {
        pd = { layers: [`${name}_layer`, `${name}_outline_layer`], source: `${name}_source`, data };
        this.placePaths[name] = pd;
        const layerStyle = PlacePathStyle[style.stroke];
        map.addSource(pd.source, { type: 'geojson', data });
        map.addLayer({
          id: pd.layers[1],
          type: 'line',
          source: pd.source,
          layout: layerStyle.layout,
          paint: layerStyle.outline
        });
        map.addLayer({
          id: pd.layers[0],
          type: 'line',
          source: pd.source,
          layout: layerStyle.layout,
          paint: { ...layerStyle.paint, 'line-color': style.color }
        });
      }
    },
    drawPlacePaths() {
      /** @type {mapboxgl.Map} */
      const map = this.map;
      for (const [name, pd] of Object.entries(this.placePaths)) {
        if (this.places.findIndex(place => place.name === name) < 0) {
          pd.layers.forEach(l => map.removeLayer(l));
          map.removeSource(pd.source);
          delete this.placePaths[name];
        }
      }
      for (const { name, path } of this.places) {
        const style = this.markerStyling[name] || {};
        if (style.stroke) {
          this.drawAnimatedPath(name, path, style);
        }
      }
    },
    async drawNamedMarkers() {
      const { LngLat, LngLatBounds, Marker } = await loadMapbox();
      const bounds = new LngLatBounds();
      /** @type {mapboxgl.Map} */
      const map = this.map;
      // remove mapMarker which disappeared in markers
      for (const [name, mapMarker] of Object.entries(this.namedMarkers)) {
        if (this.markers.findIndex(m => m.id == name) < 0) {
          mapMarker.remove();
          delete this.namedMarkers[name];
        }
      }
      for (const marker of this.markers) {
        if (!marker.position) continue;
        const { lng, lat } = marker.position;
        const lnglat = new LngLat(lng, lat);
        /** @type {mapboxgl.Marker} */
        let mapMarker = this.namedMarkers[marker.id];
        if (mapMarker) {
          mapMarker.setLngLat(lnglat);
          if (marker.type === 'drone') {
            mapMarker.getElement().querySelector('svg').style.transform = `rotate(${marker.heading}deg)`;
          }
        } else {
          if (marker.type === 'drone') {
            const element = createDroneElement(marker.name);
            element.querySelector('svg').style.transform = `rotate(${marker.heading}deg)`;
            mapMarker = new Marker({ element })
              .setLngLat(lnglat)
              .addTo(map);
          } else if (marker.type === 'depot') {
            mapMarker = new Marker({ element: createMarkerElement(marker.name), anchor: 'bottom' })
              .setLngLat(lnglat)
              .addTo(map);
          } else if (marker.type === 'action') {
            const label = marker.action.join('');
            mapMarker = new Marker({ element: createPointElement(label) })
              .setLngLat(lnglat)
              .addTo(map);
          } else if (marker.type === 'place') {
            const style = this.markerStyling[marker.name] || {};
            const color = style.color || randColor(marker.name);
            mapMarker = new Marker({ element: createMarkerElement(marker.name, color), anchor: 'bottom' })
              .setLngLat(lnglat)
              .addTo(map);
          } else {
            continue;
          }
          if (marker.type === 'depot' || marker.type === 'drone') {
            const elm = mapMarker.getElement();
            elm.onclick = () => {
              this.$emit('marker-click', marker.id, elm);
            };
          }
          this.namedMarkers[marker.id] = mapMarker;
        }
        bounds.extend(lnglat);
      }
      if (this.fit && !bounds.isEmpty() && !this.popoverShown && this.path.length <= 0) {
        // only fit to markers if no path persent
        map.fitBounds(bounds, { padding: 40, linear: true });
      }
    },
    async drawHeatmap() {
      const maxWeight = Math.max.apply(null, this.heatmap.map(p => p.weight));
      /** @type {GeoJSON.Feature<GeoJSON.Point>[]} */
      const features = [];
      for (const p of this.heatmap) {
        features.push({
          type: 'Feature',
          properties: { weight: p.weight / maxWeight },
          geometry: { type: 'Point', coordinates: [p.lng, p.lat, 0] }
        });
      }
      /** @type {GeoJSON.FeatureCollection<GeoJSON.Point>} */
      const data = { type: 'FeatureCollection', features };
      /** @type {mapboxgl.Map} */
      const map = this.map;
      if (this.heatmapData) {
        map.getSource(Heatmap.Source).setData(data);
      } else {
        this.heatmapData = data;
        map.addSource(Heatmap.Source, { type: 'geojson', data });
        map.addLayer({
          id: Heatmap.Layer,
          type: 'heatmap',
          source: Heatmap.Source,
          paint: {
            'heatmap-opacity': 0.65,
            // control heatmap weight by property weight
            'heatmap-weight': ['get', 'weight'],
            // increase heatmap weight by zoom level, or it would hardly be recognized when zoomed in
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              20, 4
            ],
          }
        });
      }
    },
    async fitPath() {
      const { LngLat, LngLatBounds } = await loadMapbox();
      const bounds = new LngLatBounds();
      for (const { lng, lat } of this.path) {
        bounds.extend(new LngLat(lng, lat));
      }
      this.map.fitBounds(bounds, { padding: 40, linear: true });
    },
    async fitMarkers() {
      const { LngLat, LngLatBounds } = await loadMapbox();
      const bounds = new LngLatBounds();
      for (const { position: { lng, lat } } of this.markers) {
        bounds.extend(new LngLat(lng, lat));
      }
      this.map.fitBounds(bounds, { padding: 40, linear: true });
    }
  },
  watch: {
    path() {
      this.drawPath();
    },
    markers() {
      this.drawPlacePaths();
      this.drawNamedMarkers();
    },
    heatmap() {
      this.drawHeatmap();
    },
    fit(val) {
      if (!val) return;
      if (this.path.length > 0) {
        this.fitPath();
      } else if (this.markers.length > 0) {
        this.fitMarkers();
      }
    },
    follow(val) {
      if (!val) return;
      if (this.path.length <= 0) return;
      this.map.setCenter(this.path[0]);
    },
    popoverShown(val) {
      if (val === false) {
        this.removeSeletedMarker();
      }
    }
  },
  created() {
    /** @type {mapboxgl.Map} */
    this.map = null;
    /** @type {GeoJSON.Feature<GeoJSON.LineString>} */
    this.pathData = null;
    /** @type {{ [key: string]: PathDescriptor }} */
    this.placePaths = {};
    /** @type {{ [key: string]: mapboxgl.Marker }} */
    this.namedMarkers = {};
    /** @type {mapboxgl.Marker} */
    this.selectedMarker = null;
  },
  mounted() {
    this.initMap().then(() => {
      if (this.path.length > 0) {
        this.drawPath();
      }
      if (this.markers.length > 0) {
        this.drawPlacePaths();
        this.drawNamedMarkers();
      }
      if (this.heatmap.length > 0) {
        this.drawHeatmap();
      }
    });
  },
  beforeDestroy() {
    const data = [
      'pathData',
      'heatmapData',
    ];
    for (const d of data) {
      this[d] = null;
    }
    const objects = [
      'selectedMarker',
      ...Object.keys(this.placePaths),
      ...Object.keys(this.namedMarkers)
    ];
    for (const prop of objects) {
      if (this[prop]) {
        if (typeof this[prop].getElement === 'function') {
          this[prop].getElement().onclick = null;
        }
        this[prop].remove();
        this[prop] = null;
      }
    }
    if (this.map) {
      __MAPBOX_ZOOM__ = this.map.getZoom();
      __MAPBOX_CENTER__ = this.map.getCenter();
      this.map.remove();
      this.map = null;
    }
  }
};
</script>

<style>
.mapbox-marker {
  cursor: pointer;
}
.mapbox-marker--drone {
  z-index: 1;
}
.mapbox-marker__label {
  position: absolute;
  top: 24px;
  left: 22px;
  padding: 2px 4px;
  border: 1px solid white;
  border-radius: 10px 0 0 0;
  font-size: 12px;
  line-height: 16px;
  background: #ea4335;
  color: white;
  font-weight: bold;
  white-space: nowrap;
  z-index: -1;
}
.mapbox-marker--action {
  cursor: pointer;
  box-sizing: border-box;
  height: 22px;
  min-width: 22px;
  padding: 3px;
  border-radius: 11px;
  border: 1px solid white;
  font-size: 12px;
  line-height: 14px;
  background: #ea433599;
  opacity: 0.8;
  transition: background-color 0.3s;
}
.mapbox-marker--action:hover {
  background: #ea4335;
  opacity: 1;
}
</style>
