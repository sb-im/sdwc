<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadGoogleMap, loadGoogleMapMarker } from '@/api/google-map';
import { MapActionEmoji } from '@/constants/map-actions';

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
    /** @type {Vue.PropOptions<{lng: number, lat: number}[]>} */
    path: {
      type: Array,
      required: false,
      default: () => []
    },
    /** @type {Vue.PropOptions<SDWC.Marker[]>} */
    markers: {
      type: Array,
      required: false,
      default: () => []
    },
    /** @type {Vue.PropOptions<{lat: number; lng: number}>} */
    center: {
      type: Object,
      required: false
    },
    fit: {
      type: Boolean,
      default: false
    },
    follow: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    async initMap() {
      const { Map, MapTypeId } = await loadGoogleMap();
      this.map = new Map(this.$refs.map, {
        zoom: __GMAP_ZOOM__ || 20,
        center: this.center || __GMAP_CENTER__ || { lat: 30, lng: 120 },
        mapTypeId: MapTypeId.SATELLITE,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });
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
    /**
     * 清除并重新绘制路径
     */
    async drawPath() {
      const { Polyline } = await loadGoogleMap();
      if (this.poly) {
        this.poly.setMap(null);
      }
      this.poly = new Polyline({
        geodesic: true,
        path: this.path,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      this.poly.setMap(this.map);
      if (this.fit) {
        this.fitPath();
      } else if (this.follow) {
        this.map.setCenter(this.path[0]);
      }
    },
    /**
     * 向已经画在地图上的路径折线增加点
     * @param {{lng: number; lat: number}[]} newPath
     */
    async patchPath(newPath) {
      const { LatLng } = await loadGoogleMap();
      // 已经画在地图上的折线点集
      /** @type {google.maps.MVCArray} */
      const mvcArray = this.poly.getPath();
      const oldLength = mvcArray.getLength();
      // 遍历每个新增的点（index 越小的点越新）
      for (let i = 0; i < newPath.length - oldLength; i++) {
        const point = newPath[i];
        // 将点的经纬度加入点集，GoogleMap 会自动更新折线
        mvcArray.insertAt(0, new LatLng(point.lat, point.lng));
      }
      if (this.fit) {
        this.fitPath();
      } else if (this.follow) {
        this.map.setCenter(this.path[0]);
      }
    },
    async drawNamedMarkers() {
      const { LatLngBounds } = await loadGoogleMap();
      /** @type {google.maps.Marker} */
      const MarkerWithLabel = await loadGoogleMapMarker();
      const bounds = new LatLngBounds();
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
              label: '🚉',
              labelContent: marker.name,
              labelAnchor: { x: -5, y: 16 },
              labelClass: 'gmap-label'
            });
          } else if (marker.type === 'drone') {
            mapMarker = new MarkerWithLabel({
              map: this.map,
              position: marker.position,
              icon: this.createMarkerDroneIcon(marker.heading),
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
     * @param {{lng: number; lat: number}[]} newPath
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
      this.drawNamedMarkers();
    },
    center(val) {
      if (!this.map) return;
      this.map.setCenter(val);
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
    }
  },
  created() {
    /** @type {google.maps.Map} */
    this.map = null;
    /** @type {google.maps.Polyline} */
    this.poly = null;
    /** @type {{[key: string]: google.maps.Marker}} */
    this.namedMarkers = {};
  },
  mounted() {
    this.initMap().then(() => {
      if (this.path.length !== 0) {
        this.drawPath();
      }
      if (this.markers.length !== 0) {
        this.drawNamedMarkers();
      }
    });
  },
  beforeDestroy() {
    Object.keys(this.namedMarkers).concat('poly').forEach(prop => {
      if (this[prop]) {
        this[prop].setMap(null);
        this[prop] = null;
      }
    });
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
  background: rgba(234, 67, 53, 0.6);
  opacity: 0.8;
}
</style>
