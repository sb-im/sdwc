<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadMapbox } from '@/api/mapbox';

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
      const { Map } = await loadMapbox();
      this.map = new Map({
        container: this.$refs.map,
        style: GoogleRasterStyle,
        maxZoom: 19,
        zoom: __MAPBOX_ZOOM__ || 20,
        center: __MAPBOX_CENTER__ || { lat: 30, lng: 120 },
      });
      return new Promise((resolve, reject) => {
        this.map.once('load', resolve);
        this.map.once('error', reject);
      });
    },
    async fitPath() {
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
    }
  },
  watch: {
    path() {
      this.drawPath();
    }
  },
  created() {
    /** @type {mapboxgl.Map} */
    this.map = null;
    /** @type {GeoJSON.Feature<GeoJSON.Geometry>} */
    this.pathData = null;
  },
  mounted() {
    this.initMap().then(() => {
      if (this.path.length !== 0) {
        this.drawPath();
      }
      if (this.markers.length !== 0) {
        // this.drawPlacePaths();
        // this.drawNamedMarkers();
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
</style>
