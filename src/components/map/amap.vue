<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import CoordTransform from 'coordtransform';

import { loadAMap, loadAMapUI } from '@/api/amap';
import { h } from '@/util/create-element';
import { waitSelector } from '@/util/wait-selector';

/**
 * @typedef {{lng: number, lat: number}} LngLatLiteral
 */

/**
 * @type {AMap.LngLat}
 * store map center across instance
 */
let __AMAP_CENTER__;

/**
 * @type {number}
 * store zoom level across instance
 */
let __AMAP_ZOOM__;

/**
 * @param {string} rgb
 * @param {number} factor
 */
function multiplyRGB(rgb, factor) {
  let res = '#';
  for (const val of rgb.match(/[0-9A-F]{2}/gi)) {
    res += Math.trunc((Number.parseInt(val, 16) * factor)).toString(16);
  }
  return res;
}

export default {
  name: 'sd-map-amap',
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
      default: '#d33d29'
    },
    popoverShown: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    async initMap() {
      const AMap = await loadAMap();
      const center = __AMAP_CENTER__ || { lat: 38, lng: 110 };
      const map = new AMap.Map(this.$refs.map, {
        zoom: __AMAP_ZOOM__ || 3,
        zooms: [3, 20],
        expandZoomRange: true,
        jogEnable: false,
        center: new AMap.LngLat(center.lng, center.lat)
      });
      AMap.plugin(['AMap.ToolBar', 'AMap.MapType', 'AMap.Scale'], () => {
        map.addControl(new AMap.ToolBar({
          liteStyle: true
        }));
        map.addControl(new AMap.MapType({
          defaultType: 1, // satellite
        }));
        map.addControl(new AMap.Scale);
      });
      map.on('dragstart', () => this.$emit('map-move'));
      map.on('mousewheel', () => this.$emit('map-move'));
      this.map = map;
      if (this.selectable) {
        this.bindMapEvents();
      }
    },
    /**
     * @param {LngLatLiteral[]} lnglat
     * @returns {Promise<AMap.LngLat[]>}
     */
    convertCoordinate(lnglat) {
      if (lnglat.length <= 0) return Promise.resolve([]);
      return new Promise(resolve => {
        loadAMap().then(AMap => {
          const result = lnglat.map(c => {
            const [lng, lat] = CoordTransform.wgs84togcj02(c.lng, c.lat);
            return new AMap.LngLat(lng, lat);
          });
          return resolve(result);
        });
      });
    },
    async bindMapEvents() {
      /** @type {AMap.Map} */
      const map = this.map;
      const AMapUI = await loadAMapUI();
      AMapUI.loadUI(['overlay/SimpleMarker'], (/** @type {AMap.Marker} */  SimpleMarker) => {
        /** @type { (position: AMap.LngLat) => void } */
        const placeMarker = position => {
          if (this.selectedMarker) {
            this.selectedMarker.setMap(map);
            this.selectedMarker.setPosition(position);
          } else {
            const marker = new SimpleMarker({
              iconStyle: 'blue',
              position,
              title: 'SelectedMarker',
            });
            marker.setMap(map);
            this.selectedMarker = marker;
          }
          waitSelector(this.$refs.map, 'div[title=SelectedMarker]').then(() => {
            const [lng, lat] = CoordTransform.gcj02towgs84(position.getLng(), position.getLat());
            this.$emit('select-point', { lng, lat }, this.selectedMarker.domNodes.container);
          });
        };
        map.on('rightclick', e => placeMarker(e.lnglat));
        map.on('movestart', () => this.$emit('cancel-point'));
        map.on('zoomstart', () => this.$emit('cancel-point'));
        // touch gestures
        let touchContinue = false;
        map.on('touchstart', e => {
          touchContinue = true;
          setTimeout(() => touchContinue && placeMarker(e.lnglat), 500);
        });
        map.on('touchend', () => touchContinue = false);
        map.on('touchmove', () => touchContinue = false);
      });
    },
    removeSeletedMarker() {
      if (!this.selectedMarker) return;
      this.selectedMarker.setMap(null);
    },
    async drawPath() {
      if (this.path.length === 0) {
        if (this.poly) {
          this.poly.setMap(null);
          this.poly = null;
        }
        return;
      }
      const { Polyline } = await loadAMap();
      let path = await this.convertCoordinate(this.path);
      if (this.poly) {
        this.poly.setPath(path);
      } else {
        this.poly = new Polyline({
          map: this.map,
          path: path,
          strokeColor: this.pathColor,
          strokeWeight: 2,
          isOutline: true,
          outlineColor: multiplyRGB(this.pathColor, 0.8),
          lineJoin: 'round'
        });
      }
      if (this.fit) {
        this.autoFit();
      } else if (this.follow && !this.popoverShown) {
        this.map.setCenter(path[0]);
      }
    },
    async drawNamedMarkers() {
      const [AMap, AMapUI, coordinate] = await Promise.all([
        loadAMap(),
        loadAMapUI(),
        this.convertCoordinate(this.markers.map(m => m.position || { lng: 0, lat: 0 }))
      ]);
      // remove mapMarker which disappeared in markers
      for (const [name, mapMarker] of Object.entries(this.namedMarkers)) {
        if (this.markers.findIndex(m => m.id == name) < 0) {
          mapMarker.setMap(null);
          delete this.namedMarkers[name];
        }
      }
      // update/create mapMarker from markers
      AMapUI.loadUI(['overlay/SimpleMarker'], (/** @type {AMap.Marker} */  SimpleMarker) => {
        // it's async, `this.markers` may have changed when executed
        if (coordinate.length !== this.markers.length) return;
        for (let i = 0; i < this.markers.length; i++) {
          const marker = this.markers[i];
          if (!marker.position) continue;
          /** @type {AMap.Marker} */
          let mapMarker = this.namedMarkers[marker.id];
          const position = coordinate[i];
          if (mapMarker) {
            mapMarker.setPosition(position);
            if (marker.type === 'drone') {
              /** @type {{ heading: number; img: HTMLImageElement }} */
              const extData = mapMarker.getExtData();
              if (extData.heading !== marker.heading) {
                extData.img.style.transform = `rotate(${marker.heading}deg)`;
              }
            }
          } else {
            if (marker.type === 'depot') {
              mapMarker = new SimpleMarker({
                iconStyle: 'red',
                position,
                extData: {
                  id: marker.id,
                },
                label: {
                  content: marker.name,
                  offset: { x: 25, y: 30 }
                }
              });
            } else if (marker.type === 'drone') {
              const img = h('img', {
                src: '/assets/icons/drone-marker-amap.svg',
                style: `transform:rotate(${marker.heading}deg)`
              });
              mapMarker = new AMap.Marker({
                content: img,
                offset: { x: -20, y: -20 },
                position,
                extData: {
                  id: marker.id,
                  img,
                  heading: marker.heading
                },
                label: {
                  content: marker.name,
                  offset: { x: 25, y: 30 }
                },
                zIndex: 200
              });
            } else if (marker.type === 'action') {
              mapMarker = new AMap.Marker({
                content: h('div', { class: 'amap-marker--action' }, marker.action),
                position,
                offset: new AMap.Pixel(-11, -11)
              });
            } else if (marker.type === 'place') {
              mapMarker = new SimpleMarker({
                iconStyle: 'red',
                position,
                label: {
                  content: marker.name,
                  offset: { x: 25, y: 30 }
                }
              });
            } else {
              continue;
            }
            if (marker.type === 'depot' || marker.type === 'drone') {
              mapMarker.on('click', () => {
                this.$emit('marker-click', mapMarker.getExtData().id, mapMarker.getContent());
              });
            }
            this.namedMarkers[marker.id] = mapMarker;
            this.map.add(mapMarker);
          }
          if (this.fit && !this.popoverShown) {
            this.autoFit();
          }
        }
      });
    },
    async drawHeatmap() {
      const data = this.heatmap.map(p => ({ lng: p.lng, lat: p.lat, count: p.weight }));
      /** @type {AMap.Map} */
      const map = this.map;
      if (!this.heatmapLayer) {
        const AMap = await loadAMap();
        map.plugin(['AMap.Heatmap'], () => {
          const hm = new AMap.Heatmap(map, { opacity: 0.65, zooms: [3, 20] });
          hm.setDataSet({ data });
          this.heatmapLayer = hm;
        });
      } else {
        this.heatmapLayer.setDataSet({ data });
      }
    },
    /**
     * 自动缩放地图以适应路径及标记点
     */
    autoFit() {
      this.map.setFitView(null, false, [20, 20, 20, 20], 20);
    }
  },
  watch: {
    path() {
      this.drawPath();
    },
    markers() {
      this.drawNamedMarkers();
    },
    heatmap() {
      this.drawHeatmap();
    },
    fit(val) {
      if (val === true) {
        this.autoFit();
      }
    },
    follow(val) {
      if (!val) return;
      if (!this.poly) return;
      const path = this.poly.getPath();
      if (path.length <= 0) return;
      this.map.setCenter(path[0]);
    },
    popoverShown(val) {
      if (val === false) {
        this.removeSeletedMarker();
      }
    }
  },
  created() {
    /** @type {AMap.Map} */
    this.map = null;
    /** @type {AMap.Polyline} */
    this.poly = null;
    /** @type {{[key: string]: AMap.Marker}} */
    this.namedMarkers = {};
    /** @type {AMap.Marker} */
    this.selectedMarker = null;
    /** AMap.Heatmap */
    this.heatmapLayer = null;
  },
  mounted() {
    this.initMap().then(() => {
      if (this.path.length > 0) {
        this.drawPath();
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
    const objects = [
      'poly',
      'selectedMarker',
      'heatmapLayer',
      ...Object.keys(this.namedMarkers)
    ];
    for (const prop of objects) {
      if (this[prop]) {
        this[prop].setMap(null);
        this[prop] = null;
      }
    }
    if (this.map) {
      __AMAP_CENTER__ = this.map.getCenter();
      __AMAP_ZOOM__ = this.map.getZoom();
      this.map.destroy();
      this.map = null;
    }
  }
};
</script>

<style>
.amap-marker-label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  padding: 2px 4px;
  border: 1px solid #a83121;
  border-radius: 10px 0 0 0;
  background: #d33d29;
  z-index: -1;
}
.amap-marker--action {
  box-sizing: border-box;
  height: 22px;
  min-width: 22px;
  padding: 2px;
  border: 1px solid #a83121;
  border-radius: 11px;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  background: #d33d2980;
  opacity: 0.8;
  transition: background-color 0.3s;
}
.amap-marker--action:hover {
  background: #d33d29;
  opacity: 1;
}
</style>
