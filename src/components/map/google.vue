<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadGoogleMap } from '@/api/google-map';

export default {
  name: 'sd-map-google',
  props: {
    path: {
      type: Array,
      required: false,
      default: () => []
    },
    positionDepot: {
      type: Object,
      required: false
    },
    center: {
      type: Object,
      required: false,
      default: () => ({ lat: 30, lng: 120 })
    },
    fit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      /** @type {google.maps.Map} */
      map: null,
      /** @type {google.maps.Polyline} */
      poly: null,
      /** @type {google.maps.Marker} */
      markerDepot: null,
      /** @type {google.maps.Marker} */
      markerDrone: null
    };
  },
  methods: {
    async initMap() {
      const { Map, MapTypeId } = await loadGoogleMap();
      this.map = new Map(this.$refs.map, {
        zoom: 20,
        center: this.path[0] || this.center,
        mapTypeId: MapTypeId.SATELLITE,
        streetViewControl: false
      });
    },
    async drawMarkerDepot() {
      if (!this.positionDepot) {
        if (this.markerDepot) {
          this.markerDepot.setMap(null);
          this.markerDepot = null;
        }
        return;
      }
      if (!this.markerDepot) {
        const { Marker } = await loadGoogleMap();
        this.markerDepot = new Marker({
          map: this.map,
          position: this.positionDepot,
          label: '🚉'
        });
      } else {
        this.markerDepot.setPosition(this.positionDepot);
      }
    },
    async drawMarkerDrone() {
      if (this.fit) return;
      if (this.path.length === 0) {
        if (this.markerDepot) {
          this.markerDrone.setMap(null);
          this.markerDrone = null;
        }
        return;
      }
      if (!this.markerDrone) {
        this.markerDrone = { setPosition() { /* noop */ } };
        const { Marker } = await loadGoogleMap();
        this.markerDrone = new Marker({
          map: this.map,
          position: this.path[0],
          label: '✈️'
        });
      } else {
        this.markerDrone.setPosition(this.path[0]);
      }
    },
    /**
     * 清除并重新绘制路径
     */
    async drawPath() {
      this.drawMarkerDrone();
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
      } else {
        this.map.setCenter(this.path[0]);
      }
    },
    /**
     * 向已经画在地图上的路径折线增加点
     * @param {{lng: number; lat: number}[]} newPath
     */
    async patchPath(newPath) {
      this.drawMarkerDrone();
      const { LatLng } = await loadGoogleMap();
      // 已经画在地图上的折线点集
      const mvcArray = this.poly.getPath();
      const oldLength = mvcArray.getLength();
      // 遍历每个新增的点（index 越小的点越新）
      for (let i = 0; i < newPath.length - oldLength; i++) {
        const point = newPath[i];
        // 将点的经纬度加入点集，GoogleMap 会自动更新折线
        mvcArray.push(new LatLng(point.lat, point.lng));
      }
      // 将地图的中心设为折线上最新的点
      this.map.setCenter(newPath[0]);
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
    center(val) {
      if (!this.map) return;
      this.map.setCenter(val);
    },
    /**
     * 判断能否只通过增新点来得到新的路线
     * 换言之，判断旧路径是否与新路径的开始点一致，且旧路径的点集为新路径点集的真子集
     * @param {{lng: number; lat: number}[]} newPath
     */
    path(newPath) {
      /** @type {google.maps.LatLng[]} */
      let oldPath = [];
      try { oldPath = this.poly.getPath().getArray(); } catch (e) { /* ignore */ }
      // 假设能
      let patchable = true;
      if (!this.poly || oldPath.length === 0) {
        // 本来没有路线，那只能从头开始画
        patchable = false;
      } else {
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
    positionDepot() {
      this.drawMarkerDepot();
    },
    fit(val) {
      if (val === true) {
        this.fitPath();
      }
    }
  },
  mounted() {
    this.initMap().then(() => {
      this.drawMarkerDepot();
      this.drawPath();
    });
  },
  beforeDestroy() {
    ['poly', 'markerDepot', 'markerDrone'].forEach(prop => {
      if (this[prop]) {
        this[prop].setMap(null);
        this[prop] = null;
      }
    });
  }
};
</script>
