<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadGoogleMap, loadGoogleMapMarker } from '@/api/google-map';
import { waitSelector } from '@/util/wait-selector';

import { randColor } from './common';

/**
 * @type {google.maps.LatLng}
 * store map center across instance
 */
let __GMAP_CENTER__;

/**
 * @type {number}
 * store zoom level across instance
 */
let __GMAP_ZOOM__;

const PathStyle = {
  dotted: 'M0 -2 c1.1 0 2 0.9 2 2 s-0.9 2 -2 2 s-2 -0.9 -2 -2 s0.9 -2 2 -2 z',
  dashed: 'M-1.5 -1.5 h3 v6 h-3 z'
};

/**
 * @param {SDWC.DroneMapStyling} style
 * @returns {google.maps.Symbol}
 */
function createPathIcon(style) {
  /** @type {google.maps.Symbol} */
  return {
    path: PathStyle[style.stroke],
    scale: 1,
    fillColor: style.color,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeOpacity: 1,
    strokeWeight: 1
  };
}

/**
 * @param {string} fillColor
 * @returns {Partial<google.maps.Symbol>}
 */
function createMarkerPointIcon(fillColor = '#ea4335') {
  return {
    anchor: { x: 20, y: 39 },
    labelOrigin: { x: 20, y: 15 },
    path: 'M20,38 C18,36 7.5,24 7.5,14 C7.5,7 13,1.5 20,1.5 S32.5,7 32.5,14 C32.5,24 22,36 20,38 z',
    fillColor,
    fillOpacity: 1,
    strokeColor: '#fff',
  };
}

/**
 * @param {number} rotation
 * @returns {Partial<google.maps.Symbol>}
 */
function createMarkerDroneIcon(rotation) {
  return {
    anchor: { x: 20, y: 20 },
    path: 'M20,2L8 33.5 20 28 32 33.5z',
    fillColor: '#ea4335',
    fillOpacity: 1,
    strokeColor: '#fff',
    rotation
  };
}

export default {
  name: 'sd-map-google',
  props: {
    /** @type {Vue.PropOptions<google.maps.LatLngLiteral[]>} */
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
      const { event, Map, MapTypeId } = await loadGoogleMap();
      const map = new Map(this.$refs.map, {
        maxZoom: 20,
        zoom: __GMAP_ZOOM__ || 1.5,
        center: __GMAP_CENTER__ || { lat: 27, lng: 162 },
        mapTypeId: MapTypeId.SATELLITE,
        mapTypeControl: false,
        scaleControl: true,
        fullscreenControl: false,
        streetViewControl: false,
        draggableCursor: 'grab',
        draggingCursor: 'grabbing'
      });
      map.addListener('dragstart', () => this.$emit('map-move'));
      event.addDomListener(this.$refs.map, 'mousewheel', () => this.$emit('map-move'));
      this.map = map;
      if (this.selectable) {
        this.bindMapEvents();
      }
    },
    async bindMapEvents() {
      /** @type {google.maps.Map} */
      const map = this.map;
      const { Marker, event } = await loadGoogleMap();
      /** @type { (position: google.maps.LatLng) => void } */
      const placeMarker = position => {
        if (this.selectedMarker) {
          this.selectedMarker.setMap(map);
          this.selectedMarker.setPosition(position);
        } else {
          this.selectedMarker = new Marker({
            map,
            position,
            title: 'SelectedMarker',
            icon: createMarkerPointIcon('#409eff')
          });
        }
        waitSelector(this.$refs.map, 'div[title=SelectedMarker]').then(el => {
          const point = { lat: position.lat(), lng: position.lng() };
          this.$emit('select-point', point, el);
        });
      };
      map.addListener('rightclick', (/** @type {google.maps.MouseEvent} */ e) => placeMarker(e.latLng));
      map.addListener('mousedown', (/** @type {google.maps.MouseEvent} */ e) => {
        let touchContinue = true;
        event.addListenerOnce(map, 'mouseup', () => touchContinue = false);
        event.addListenerOnce(map, 'dragstart', () => touchContinue = false);
        setTimeout(() => touchContinue && placeMarker(e.latLng), 500);
      });
      map.addListener('bounds_changed', () => {
        this.$emit('cancel-point');
        this.removeSeletedMarker();
      });
    },
    removeSeletedMarker() {
      if (!this.selectedMarker) return;
      this.selectedMarker.setMap(null);
    },
    /**
     * 清除并重新绘制路径
     */
    async drawPath() {
      const { Polyline } = await loadGoogleMap();
      if (this.poly) {
        this.polyB.setMap(null);
        this.poly.setMap(null);
      }
      // wider polyline as border
      this.polyB = new Polyline({
        map: this.map,
        path: this.path,
        strokeColor: '#fff',
        strokeWeight: 4
      });
      this.poly = new Polyline({
        map: this.map,
        path: this.path,
        strokeColor: this.pathColor,
        strokeWeight: 2
      });
    },
    /**
     * 向已经画在地图上的路径折线增加点
     * @param {google.maps.LatLngLiteral[]} newPath
     */
    async patchPath(newPath) {
      const { LatLng } = await loadGoogleMap();
      // 已经画在地图上的折线点集
      /** @type {google.maps.MVCArray} */
      const mvcArray = this.poly.getPath();
      const mvcArrayB = this.polyB.getPath();
      const oldLength = mvcArray.getLength();
      // 遍历每个新增的点（index 越小的点越新）
      for (let i = 0; i < newPath.length - oldLength; i++) {
        const point = newPath[i];
        // 将点的经纬度加入点集，GoogleMap 会自动更新折线
        mvcArray.insertAt(0, new LatLng(point.lat, point.lng));
        mvcArrayB.insertAt(0, new LatLng(point.lat, point.lng));
      }
    },
    /**
     * @param {string} name
     * @param {google.maps.LatLng[]} points
     * @param {SDWC.DroneMapStyling} style
     */
    async drawAnimatedPath(name, points, style) {
      if (!this.map) return;
      const { Polyline } = await loadGoogleMap();
      const path = this.placePaths[name];
      if (path) {
        path.setPath(points);
        return;
      }
      /** @type {google.maps.IconSequence} */
      const icon = {
        icon: createPathIcon(style),
        offset: '0px',
        repeat: '10px'
      };
      const p = new Polyline({
        map: this.map,
        icons: [icon],
        path: points,
        strokeOpacity: 0
      });
      this.placePaths[name] = p;
      const callback = (time) => {
        if (!this.placePaths[name] || !this.map) return;
        icon.offset = `${((time / 100) % 10)}px`;
        p.set('icons', [icon]);
        requestAnimationFrame(callback);
      };
      requestAnimationFrame(callback);
    },
    async drawPlacePaths() {
      for (const [name, line] of Object.entries(this.placePaths)) {
        if (this.places.findIndex(place => place.name === name) < 0) {
          line.setMap(null);
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
      /** @type {google.maps.Marker} */
      const MarkerWithLabel = await loadGoogleMapMarker();
      // remove mapMarker which disappeared in markers
      for (const [name, mapMarker] of Object.entries(this.namedMarkers)) {
        if (this.markers.findIndex(m => m.id == name) < 0) {
          mapMarker.setMap(null);
          delete this.namedMarkers[name];
        }
      }
      // update/create mapMarker from markers
      for (const marker of this.markers) {
        if (!marker.position) continue;
        /** @type {google.maps.Marker} */
        let mapMarker = this.namedMarkers[marker.id];
        if (mapMarker) {
          mapMarker.setPosition(marker.position);
          if (marker.type === 'drone') {
            /** @type {google.maps.ReadonlySymbol} */
            const icon = mapMarker.getIcon();
            if (icon.rotation !== marker.heading) {
              mapMarker.setIcon({ ...icon, rotation: marker.heading });
            }
          }
        } else {
          if (marker.type === 'depot') {
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: createMarkerPointIcon(),
              title: marker.name,
              labelContent: marker.name,
              labelAnchor: { x: -6, y: 12 },
              labelClass: 'gmap-label'
            });
          } else if (marker.type === 'drone') {
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: createMarkerDroneIcon(marker.heading),
              title: marker.name,
              labelInBackground: true,
              labelContent: marker.name,
              labelAnchor: { x: 0, y: -10 },
              labelClass: 'gmap-label',
              zIndex: 100
            });
          } else if (marker.type === 'action') {
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: {
                anchor: { x: 0, y: 0 },
                path: ''
              },
              labelContent: marker.action.join(''),
              labelAnchor: { x: 10, y: 10 },
              labelClass: 'gmap-action'
            });
          } else if (marker.type === 'place') {
            const style = this.markerStyling[marker.name] || {};
            const color = style.color || randColor(marker.name);
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: createMarkerPointIcon(color),
              labelContent: marker.name,
              labelAnchor: { x: -6, y: 12 },
              labelClass: 'gmap-label',
              labelStyle: { backgroundColor: color }
            });
          } else {
            continue;
          }
          if (marker.type === 'depot' || marker.type === 'drone') {
            mapMarker.set('sd-node-id', marker.id);
            mapMarker.addListener('click', () => {
              const id = mapMarker.get('sd-node-id');
              const el = Array.from(this.$el.querySelectorAll(`div[title=${marker.name}]`));
              if (el.length > 0) {
                for (const e of el) {
                  if (!e.classList.contains('gmap-label')) {
                    this.$emit('marker-click', id, e);
                    return;
                  }
                }
              }
            });
          }
          this.namedMarkers[marker.id] = mapMarker;
        }
      }
    },
    async drawHeatMap() {
      const { LatLng, visualization: { HeatmapLayer } } = await loadGoogleMap();
      const data = this.heatmap.map(p => ({ location: new LatLng(p.lat, p.lng), weight: p.weight }));
      if (this.heatmapLayer) {
        this.heatmapLayer.setData(data);
      } else {
        this.heatmapLayer = new HeatmapLayer({ map: this.map, data, opacity: 0.65 });
      }
    },
    /**
     * 自动缩放地图以适应路径
     */
    async fitPath() {
      if (!this.map || !this.path) return;
      const { LatLngBounds } = await loadGoogleMap();
      const bounds = new LatLngBounds();
      for (const point of this.path) {
        bounds.extend(point);
      }
      this.map.fitBounds(bounds);
    },
    /**
     * 自动缩放地图以适应标记点
     */
    async fitMarkers() {
      if (!this.map || this.markers.length <= 0) return;
      const { LatLngBounds } = await loadGoogleMap();
      const bounds = new LatLngBounds();
      for (const marker of this.markers) {
        bounds.extend(marker.position);
      }
      this.map.fitBounds(bounds);
    },
    /**
     * 自动缩放地图，以适应路径或标记点
     */
    autoFit() {
      if (this.path.length > 0) {
        this.fitPath();
      } else if (this.markers.length > 0) {
        this.fitMarkers();
      }
    }
  },
  watch: {
    /**
     * 判断能否只通过增新点来得到新的路线
     * 换言之，判断旧路径是否与新路径的开始点一致，且旧路径的点集为新路径点集的真子集
     * @param {google.maps.LatLngLiteral[]} newPath
     */
    path(newPath) {
      // 任务路径点，每次都重绘
      if (this.fit) {
        this.drawPath().then(() => this.fitPath());
      }
      // 假设能
      let patchable = true;
      if (!this.poly) {
        // 本来没有路线，那只能从头开始画
        patchable = false;
      } else {
        /** @type {google.maps.LatLng[]} */
        const oldPath = this.poly.getPath().getArray();
        // 计算新旧路径的长度差值
        const lengthDiff = newPath.length - oldPath.length;
        // 新路径上的点比旧路径上的点少，只能从头开始画
        if (lengthDiff < 0) {
          patchable = false;
        } else {
          // 遍历两个路径中前 X 个点，X 为旧路径上点的数量
          for (let i = 0; i < oldPath.length; i++) {
            // 数组中 index 越小的点越新
            // 旧路径上从第 i 最旧的点的 index 是 i
            // 对应新路径上第 i 最旧的点的 index 是 i + lengthDiff
            const pNew = newPath[i + lengthDiff];
            const pOld = oldPath[i];
            if (Math.abs(pNew.lat - pOld.lat()) > 1e-9 || Math.abs(pNew.lng - pOld.lng()) > 1e-9) {
              // 只要有对应点的经纬度不同，就不能
              patchable = false;
              break;
            }
          }
        }
      }
      const op = patchable ? this.patchPath(newPath) : this.drawPath();
      op.then(() => {
        if (this.follow && !this.popoverShown && newPath.length > 0) {
          this.map.setCenter(newPath[0]);
        }
      });
    },
    markers() {
      this.drawPlacePaths();
      this.drawNamedMarkers();
      if (this.fit && !this.popoverShown && this.path.length <= 0) {
        this.fitMarkers();
      }
    },
    heatmap() {
      this.drawHeatMap();
    },
    fit(val) {
      if (!val) return;
      this.autoFit();
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
    /** @type {google.maps.Map} */
    this.map = null;
    /** @type {google.maps.MapsEventListener[]} */
    this.listeners = [];
    /** @type {google.maps.Polyline} */
    this.poly = null;
    /** @type {google.maps.Polyline} */
    this.polyB = null;
    /** @type {{[key: string]: google.maps.Polyline}} */
    this.placePaths = {};
    /** @type {{[key: string]: google.maps.Marker}} */
    this.namedMarkers = {};
    /** @type {google.maps.Marker} */
    this.selectedMarker = null;
    /** @type {google.maps.visualization.HeatmapLayer} */
    this.heatmapLayer = null;
  },
  mounted() {
    this.initMap().then(() => {
      if (this.fit) {
        this.autoFit();
      }
      if (this.path.length > 0) {
        this.drawPath();
        if (this.follow) {
          this.map.setCenter(this.path[0]);
        }
      }
      if (this.markers.length > 0) {
        this.drawPlacePaths();
        this.drawNamedMarkers();
      }
      if (this.heatmap.length > 0) {
        this.drawHeatMap();
      }
    });
  },
  beforeDestroy() {
    for (const l of this.listeners) {
      l.remove();
    }
    const objects = [
      'poly',
      'polyB',
      'selectedMarker',
      'heatmapLayer',
      ...Object.keys(this.placePaths),
      ...Object.keys(this.namedMarkers)
    ];
    for (const prop of objects) {
      if (this[prop]) {
        this[prop].setMap(null);
        this[prop] = null;
      }
    }
    if (this.map) {
      __GMAP_CENTER__ = this.map.getCenter();
      __GMAP_ZOOM__ = this.map.getZoom();
      this.map = null;
    }
  }
};
</script>

<style>
.gmap-label {
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  padding: 2px 4px;
  border: 1px solid white;
  border-radius: 10px 0 0 0;
  background: #ea4335;
}
.gmap-action {
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
}
</style>
