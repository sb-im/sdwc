<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { mapState } from 'vuex';

import { loadMapbox } from '@/api/mapbox';
import { h, hs } from '@/util/create-element';
import { waitSelector } from '@/util/wait-selector';

import { randColor } from './common';

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

const Boundary = {
  Source: 'boundary_source',
  Layer: 'boundary_layer',
  /** @type {mapboxgl.FillPaint} */
  Paint: { 'fill-color': '#03a9f4', 'fill-opacity': 0.3 }
};

/** @type {{ [key: string]: { layout: mapboxgl.LineLayout, outline: mapboxgl.LinePaint, paint: mapboxgl.LinePaint } }} */
const PolylineStyle = {
  solid: {
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-width': 2 },
    outline: { 'line-width': 4, 'line-color': '#fff' }
  },
  dotted: {
    layout: { 'line-cap': 'round', 'line-join': 'round' },
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
  return h('div', { class: 'mapbox-marker--action' }, [
    h('i', { class: 'material-icons' }, action)
  ]);
}

export default {
  name: 'sd-map-mapbox',
  props: {
    /** @type {Vue.PropOptions<SDWC.GPSCoordinate[]>} */
    boundary: {
      type: Array,
      default: () => []
    },
    /** @type {Vue.PropOptions<SDWC.MapPolyline[]>} */
    polylines: {
      type: Array,
      default: () => []
    },
    /** @type {Vue.PropOptions<SDWC.Marker[]>} */
    markers: {
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
    popoverShown: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    mapInitialized: false
  }),
  computed: {
    ...mapState([
      'config'
    ])
  },
  methods: {
    async initMap() {
      if (this.config.map_tiles_url) {
        GoogleRasterStyle.sources.google.tiles = [this.config.map_tiles_url];
      }
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
      await new Promise(resolve => map.once('load', resolve));
      this.mapInitialized = true;
      return map;
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
    async drawBoundary() {
      /** @type {mapboxgl.Map} */
      const map = this.map;
      if (!map || this.boundary.length <= 0) return;
      const lnglats = this.boundary.map(p => [p.lng, p.lat]);
      /** @type {GeoJSON.Polygon} */
      const boundaryData = { type: 'Polygon', coordinates: [lnglats] };
      if (this.boundaryData) {
        map.getSource(Boundary.Source).setData(boundaryData);
      } else {
        map.addSource(Boundary.Source, { type: 'geojson', data: boundaryData });
        // if `path` layers already exists, `Boundary.Layer` must beneath it
        const PathOutlineLayer = 'path_outline_layer';
        const hasOutlineLayer = typeof map.getLayer(PathOutlineLayer) === 'object';
        map.addLayer({
          id: Boundary.Layer,
          type: 'fill',
          source: Boundary.Source,
          paint: Boundary.Paint
        }, hasOutlineLayer ? PathOutlineLayer : undefined);
      }
      this.boundaryData = boundaryData;
    },
    async drawNamedPolylines() {
      /** @type {mapboxgl.Map} */
      const map = this.map;
      for (const [name, pd] of Object.entries(this.namedPolylines)) {
        // remove unused polylines
        if (this.polylines.findIndex(place => place.name === name) < 0) {
          pd.layers.forEach(l => map.removeLayer(l));
          map.removeSource(pd.source);
          delete this.namedPolylines[name];
        }
      }
      for (const l of this.polylines) {
        const { name, style, coordinates } = l;
        if (!style.stroke) return;
        /** @type {GeoJSON.LineString} */
        const data = { type: 'LineString', coordinates: coordinates.map(p => [p.lng, p.lat]) };
        /** @type {SDWC.PolylineDescriptor} */
        let pd = this.namedPolylines[name];
        if (pd) {
          pd.data = data;
          map.getSource(pd.source).setData(data);
          continue;
        } else {
          pd = { layers: [`${name}_layer`, `${name}_outline_layer`], source: `${name}_source`, data };
          this.namedPolylines[name] = pd;
          const layerStyle = PolylineStyle[style.stroke];
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
          if (name.startsWith('waypoint')) {
            // move `waypoint` layers beneath `path` layers
            const PathOutlineLayer = 'path_outline_layer';
            if (typeof map.getLayer(PathOutlineLayer) !== 'object') return;
            map.moveLayer(pd.layers[0], PathOutlineLayer);
            map.moveLayer(pd.layers[1], pd.layers[0]);
          }
        }
      }
      if (this.fit) {
        this.fitPath();
      } else if (this.follow && !this.popoverShown) {
        this.followPath();
      }
    },
    async drawNamedMarkers() {
      const { LngLat, LngLatBounds, Marker } = await loadMapbox();
      const bounds = new LngLatBounds();
      /** @type {mapboxgl.Map} */
      const map = this.map;
      // remove unused markers
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
          // patch existing markers
          mapMarker.setLngLat(lnglat);
          if (marker.type === 'drone') {
            mapMarker.getElement().querySelector('svg').style.transform = `rotate(${marker.heading}deg)`;
          } else if (marker.type === 'depot') {
            const labelElm = mapMarker.getElement().getElementsByClassName('mapbox-marker__label')[0];
            if (labelElm.textContet !== marker.name) {
              labelElm.textContent = marker.name;
            }
          } else if (marker.type === 'action') {
            mapMarker.getElement().getElementsByClassName('material-icons')[0].textContent = marker.action.join('');
          } /* else if (marker.type === 'place') {
            // 'place' marker's id is bind to its name (at least for now)
            // so we should not need to patch it
          } */
        } else {
          // create new markers
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
            const color = marker.style.color || randColor(marker.name);
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
      if (this.fit && !bounds.isEmpty() && !this.popoverShown) {
        // only fit to markers if no path persent
        this.fitPath().then(success => {
          if (!success) this.map.fitBounds(bounds, { padding: 40, linear: true });
        });
      }
    },
    async drawHeatmap() {
      /** @type {mapboxgl.Map} */
      const map = this.map;
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
    async followPath() {
      const path = this.polylines.find(l => l.name === 'path');
      if (!path) return false;
      const { coordinates } = path;
      if (!coordinates || coordinates.length <= 0) return false;
      this.map.setCenter(path.coordinates[0]);
      return true;
    },
    async fitPath(duration = 500) {
      const { LngLat, LngLatBounds } = await loadMapbox();
      const bounds = new LngLatBounds();
      const path = this.polylines.find(l => l.name === 'path');
      if (!path || !path.coordinates) return false;
      for (const { lng, lat } of path.coordinates) {
        bounds.extend(new LngLat(lng, lat));
      }
      this.map.fitBounds(bounds, { padding: 40, linear: true, duration });
      return true;
    },
    async fitMarkers() {
      const { LngLat, LngLatBounds } = await loadMapbox();
      const bounds = new LngLatBounds();
      for (const { position: { lng, lat } } of this.markers) {
        bounds.extend(new LngLat(lng, lat));
      }
      if (bounds.isEmpty()) return false;
      this.map.fitBounds(bounds, { padding: 40, linear: true });
      return true;
    }
  },
  watch: {
    boundary() {
      if (!this.mapInitialized) return;
      this.drawBoundary();
    },
    polylines() {
      if (!this.mapInitialized) return;
      this.drawNamedPolylines();
    },
    markers() {
      if (!this.mapInitialized) return;
      this.drawNamedMarkers();
    },
    heatmap() {
      if (!this.mapInitialized) return;
      this.drawHeatmap();
    },
    fit(val) {
      if (!this.mapInitialized || !val) return;
      this.fitPath().then(success => {
        if (!success) () => this.fitMarkers();
      });
    },
    follow(val) {
      if (!this.mapInitialized || !val) return;
      this.followPath();
    },
    popoverShown(val) {
      if (!this.mapInitialized) return;
      if (val === false) {
        this.removeSeletedMarker();
      }
    }
  },
  created() {
    /** @type {mapboxgl.Map} */
    this.map = null;
    /** @type {GeoJSON.Polygon} */
    this.boundaryData = null;
    /** @type {{ [key: string]: SDWC.PolylineDescriptor }} */
    this.namedPolylines = {};
    /** @type {GeoJSON.FeatureCollection<GeoJSON.Point>} */
    this.heatmapData = null;
    /** @type {{ [key: string]: mapboxgl.Marker }} */
    this.namedMarkers = {};
    /** @type {mapboxgl.Marker} */
    this.selectedMarker = null;
  },
  mounted() {
    this.initMap().then(() => {
      // map is loaded and initialized
      if (this.boundary.length > 0) {
        this.drawBoundary();
      }
      if (this.polylines.length > 0) {
        this.drawNamedPolylines().then(() => this.fitPath(0));
      }
      if (this.markers.length > 0) {
        this.drawNamedMarkers();
      }
      if (this.heatmap.length > 0) {
        this.drawHeatmap();
      }
    });
  },
  beforeDestroy() {
    const data = [
      'boundaryData',
      'heatmapData',
    ];
    for (const d of data) {
      this[d] = null;
    }
    const objects = [
      'selectedMarker',
      ...Object.keys(this.namedPolylines),
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
  padding: 2px;
  border-radius: 11px;
  border: 1px solid white;
  color: white;
  font-size: 16px;
  background: #ea433599;
  opacity: 0.8;
  transition: background-color 0.3s;
}
.mapbox-marker--action:hover {
  background: #ea4335;
  opacity: 1;
}
</style>
