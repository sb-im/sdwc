<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadMapbox } from '@/api/mapbox';

import { h, hs } from '@/util/create-element';
import { MapActionEmoji } from '@/constants/map-actions';

import { randColor } from './common';

/**
 * @typedef {{lng: number, lat: number}} LngLatLiteral
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

const PathSource = 'PathSource';
const PathLayer = 'PathLayer';
const PathOutlineLayer = 'PathOutlineLayer';

/** @type {mapboxgl.LineLayout} */
const PathLayout = { 'line-cap': 'round', 'line-join': 'round' };

function createMarkerElement(label = '', color = '#ea4335') {
  return h('div', { width: 29, height: 37 }, [
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
  return h('div', { width: 34, height: 34 }, [
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
        zoom: __MAPBOX_ZOOM__ || 20,
        center: __MAPBOX_CENTER__ || { lat: 30, lng: 120 },
      });
      map.addControl(new ScaleControl(), 'bottom-left');
      map.addControl(new NavigationControl(), 'bottom-right');
      this.map = map;
      return new Promise((resolve, reject) => {
        map.once('load', resolve);
        map.once('error', reject);
      });
    },
    async fitPath() {
      if (!this.pathData) return;
      const { LngLatBounds } = await loadMapbox();
      const bounds = new LngLatBounds();
      const { coordinates } = this.pathData.geometry;
      for (const cord of coordinates) {
        bounds.extend(cord);
      }
      this.map.fitBounds(bounds, { padding: 40, linear: true });
    },
    async drawPath() {
      const coordinates = this.path.map(p => [p.lng, p.lat]);
      /** @type {mapboxgl.Map} */
      const map = this.map;
      /** @type {GeoJSON.Feature<GeoJSON.Geometry>} */
      const pathData = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates }
      };
      if (this.pathData) {
        map.getSource(PathSource).setData(pathData);
      } else {
        map.addSource(PathSource, { type: 'geojson', data: pathData });
        map.addLayer({
          id: PathOutlineLayer,
          type: 'line',
          source: PathSource,
          layout: PathLayout,
          paint: { 'line-color': '#fff', 'line-width': 4, }
        });
        map.addLayer({
          id: PathLayer,
          type: 'line',
          source: PathSource,
          layout: PathLayout,
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
    async drawNamedMarkers() {
      const { LngLat, LngLatBounds, Marker } = await loadMapbox();
      const bounds = new LngLatBounds();
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
              .addTo(this.map);
          } else if (marker.type === 'depot') {
            mapMarker = new Marker({ element: createMarkerElement(marker.name), anchor: 'bottom' })
              .setLngLat(lnglat)
              .addTo(this.map);
          } else if (marker.type === 'action') {
            const label = marker.action.map(a => MapActionEmoji[a]).join('');
            mapMarker = new Marker({ element: createPointElement(label) })
              .setLngLat(lnglat)
              .addTo(this.map);
          } else if (marker.type === 'place') {
            const style = this.markerStyling[marker.name] || {};
            const color = style.color || randColor(marker.name);
            mapMarker = new Marker({ element: createMarkerElement(marker.name, color), anchor: 'bottom' })
              .setLngLat(lnglat)
              .addTo(this.map);
          }
          this.namedMarkers[marker.id] = mapMarker;
        }
        bounds.extend(lnglat);
      }
      if (this.fit && !bounds.isEmpty() && this.path.length === 0) {
        // only fit to markers if no path persent
        this.map.fitBounds(bounds, { padding: 40, linear: true });
      }
    }
  },
  watch: {
    path() {
      this.drawPath();
    },
    markers() {
      // this.drawPlacePaths();
      this.drawNamedMarkers();
    },
    fit(val) {
      if (val === true) {
        this.fitPath();
      }
    },
    follow(val) {
      if (!val) return;
      if (this.path.length <= 0) return;
      this.map.setCenter(this.path[0]);
    },
    // popoverShown(val) {
    //   if (val === false) {
    //     this.removeSeletedMarker();
    //   }
    // }
  },
  created() {
    /** @type {mapboxgl.Map} */
    this.map = null;
    /** @type {GeoJSON.Feature<GeoJSON.Geometry>} */
    this.pathData = null;
    /** @type {{ [key: string]: mapboxgl.Marker }} */
    this.namedMarkers = {};
  },
  mounted() {
    this.initMap().then(() => {
      if (this.path.length !== 0) {
        this.drawPath();
      }
      if (this.markers.length !== 0) {
        // this.drawPlacePaths();
        this.drawNamedMarkers();
      }
    });
  },
  beforeDestroy() {
    if (this.map) {
      __MAPBOX_ZOOM__ = this.map.getZoom();
      __MAPBOX_CENTER__ = this.map.getCenter();
    }
  }
};
</script>

<style>
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
