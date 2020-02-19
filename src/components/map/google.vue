<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadGoogleMap, loadGoogleMapMarker } from '@/api/google-map';
import { MapActionEmoji } from '@/constants/map-actions';

import { waitSelector, randColor } from './common';

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
      const { Map, MapTypeId } = await loadGoogleMap();
      this.map = new Map(this.$refs.map, {
        zoom: __GMAP_ZOOM__ || 20,
        center: __GMAP_CENTER__ || { lat: 30, lng: 120 },
        mapTypeId: MapTypeId.SATELLITE,
        mapTypeControl: false,
        scaleControl: true,
        fullscreenControl: false,
        streetViewControl: false,
        draggableCursor: 'grab',
        draggingCursor: 'grabbing'
      });
      if (this.selectable) {
        this.bindMapEvents();
      }
    },
    /**
     * @param {SDWC.DroneMapStyling} style
     * @returns {google.maps.Symbol}
     */
    createPathIcon(style) {
      const PathStyle = {
        dotted: 'M0 -2 c1.10456949966 0 2 0.895430500338 2 2 s-0.895430500338 2 -2 2 s-2 -0.895430500338 -2 -2 s0.895430500338 -2 2 -2 z',
        dashed: 'M-1.5 -1.5 h3 v6 h-3 z'
      };
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
    },
    /**
     * @param {string} fillColor
     * @returns {Partial<google.maps.Symbol>}
     */
    createMarkerPointIcon(fillColor = '#ea4335') {
      return {
        anchor: { x: 20, y: 39 },
        labelOrigin: { x: 20, y: 15 },
        path: 'M20,38 C18,36 7.5,24 7.5,14 C7.5,7 13,1.5 20,1.5 S32.5,7 32.5,14 C32.5,24 22,36 20,38 z',
        fillColor,
        fillOpacity: 1,
        strokeColor: '#fff',
      };
    },
    /**
     * @param {number} rotation
     * @returns {Partial<google.maps.Symbol>}
     */
    createMarkerDroneIcon(rotation) {
      return {
        anchor: { x: 20, y: 20 },
        path: 'M20,2L8 33.5 20 28 32 33.5z',
        fillColor: '#ea4335',
        fillOpacity: 1,
        strokeColor: '#fff',
        rotation
      };
    },
    async bindMapEvents() {
      const { Marker, event } = await loadGoogleMap();
      this.map.addListener('dragstart', () => this.$emit('map-move'));
      /** @type { (position: google.maps.LatLng) => void } */
      const placeMarker = position => {
        if (this.selectedMarker) {
          this.selectedMarker.setMap(this.map);
          this.selectedMarker.setPosition(position);
        } else {
          this.selectedMarker = new Marker({
            map: this.map,
            position,
            title: 'SelectedMarker',
            icon: this.createMarkerPointIcon('#409eff')
          });
        }
        waitSelector(this.$refs.map, 'div[title=SelectedMarker]', true).then(el => {
          const point = { lat: position.lat(), lng: position.lng() };
          this.$emit('select-point', point, el);
        });
      };
      this.map.addListener('rightclick', (/** @type {google.maps.MouseEvent} */ e) => placeMarker(e.latLng));
      this.map.addListener('mousedown', (/** @type {google.maps.MouseEvent} */ e) => {
        let touchContinue = true;
        event.addListenerOnce(this.map, 'mouseup', () => touchContinue = false);
        event.addListenerOnce(this.map, 'dragstart', () => touchContinue = false);
        setTimeout(() => touchContinue && placeMarker(e.latLng), 500);
      });
      this.map.addListener('bounds_changed', () => {
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
      if (this.fit) {
        this.fitPath();
      } else if (this.follow && !this.popoverShown) {
        this.map.setCenter(this.path[0]);
      }
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
      if (this.fit) {
        this.fitPath();
      } else if (this.follow && !this.popoverShown) {
        this.map.setCenter(this.path[0]);
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
        icon: this.createPathIcon(style),
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
        if (!this.map) return;
        icon.offset = `${((time / 100) % 10)}px`;
        p.set('icons', [icon]);
        requestAnimationFrame(callback);
      };
      requestAnimationFrame(callback);
    },
    async drawPlacePaths() {
      for (const [name, line] of Object.entries(this.placePaths)) {
        if (!Object.prototype.hasOwnProperty.call(this.places, name)) {
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
      const { LatLngBounds } = await loadGoogleMap();
      /** @type {google.maps.Marker} */
      const MarkerWithLabel = await loadGoogleMapMarker();
      const bounds = new LatLngBounds();
      for (const [name, m] of Object.entries(this.namedMarkers)) {
        if (this.markers.findIndex(m => m.id == name) < 0) {
          m.setMap(null);
          delete this.namedMarkers[name];
        }
      }
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
              icon: this.createMarkerPointIcon(),
              label: '🚉',
              labelContent: marker.name,
              labelAnchor: { x: -6, y: 12 },
              labelClass: 'gmap-label'
            });
          } else if (marker.type === 'drone') {
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: this.createMarkerDroneIcon(marker.heading),
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
              labelContent: marker.action.map(a => MapActionEmoji[a]).join(''),
              labelAnchor: { x: 10, y: 10 },
              labelClass: 'gmap-action'
            });
          } else if (marker.type === 'place') {
            const style = this.markerStyling[marker.name] || {};
            const color = style.color || randColor(marker.name);
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: this.createMarkerPointIcon(color),
              labelContent: marker.name,
              labelAnchor: { x: -6, y: 12 },
              labelClass: 'gmap-label',
              labelStyle: { backgroundColor: color }
            });
          } else {
            continue;
          }
          this.namedMarkers[marker.id] = mapMarker;
        }
        bounds.extend(mapMarker.getPosition());
      }
      if ((!this.path || this.path.length === 0) && this.fit && !bounds.isEmpty()) {
        // only fit to markers if no path persent
        this.map.fitBounds(bounds);
      }
    },
    /**
     * 自动缩放地图以适应路径
     */
    async fitPath() {
      const { LatLngBounds } = await loadGoogleMap();
      if (this.map && this.poly) {
        const bounds = new LatLngBounds();
        const mvcArray = this.poly.getPath();
        mvcArray.forEach(elem => {
          bounds.extend(elem);
        });
        this.map.fitBounds(bounds);
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
        return this.drawPath();
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
      if (patchable) {
        this.patchPath(newPath);
      } else {
        this.drawPath();
      }
    },
    markers() {
      this.drawPlacePaths();
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
    popoverShown(val) {
      if (val === false) {
        this.removeSeletedMarker();
      }
    }
  },
  created() {
    /** @type {google.maps.Map} */
    this.map = null;
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
  },
  mounted() {
    this.initMap().then(() => {
      if (this.path.length !== 0) {
        this.drawPath();
      }
      if (this.markers.length !== 0) {
        this.drawPlacePaths();
        this.drawNamedMarkers();
      }
    });
  },
  beforeDestroy() {
    const objects = [
      'poly',
      'polyB',
      'selectedMarker',
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
