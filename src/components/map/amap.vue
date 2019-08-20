<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadAMap, loadAMapUI } from '@/api/amap';

export default {
  name: 'sd-map-amap',
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
    markers: {
      type: Array,
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
  methods: {
    async initMap() {
      const AMap = await loadAMap();
      const center = this.path[0] || this.center;
      this.map = new AMap.Map(this.$refs.map, {
        zoom: 18,
        center: new AMap.LngLat(center.lng, center.lat)
      });
      AMap.plugin(['AMap.ToolBar', 'AMap.MapType', 'AMap.Scale'], () => {
        this.map.addControl(new AMap.ToolBar({
          liteStyle: true
        }));
        this.map.addControl(new AMap.MapType({
          defaultType: 1, // satellite
        }));
        this.map.addControl(new AMap.Scale);
      });
    },
    /**
     * @param {{lng: number; lat: number}[]} lnglat
     * @returns {Promise<AMap.LngLat[]>}
     */
    convertCoordinate(lnglat) {
      return new Promise((resolve, reject) => {
        loadAMap().then(AMap => {
          if (lnglat.length <= 40) {
            AMap.convertFrom(lnglat.map(p => [p.lng, p.lat]), 'gps', (status, result) => {
              if (result.info === 'ok') {
                resolve(result.locations);
              } else {
                reject(status);
              }
            });
          } else {
            const left = lnglat.slice(0, 40);
            const right = lnglat.slice(40);
            Promise.all([
              this.convertCoordinate(left),
              this.convertCoordinate(right)
            ]).then(([l, r]) => {
              resolve(l.concat(r));
            }).catch(e => {
              console.error('convertCoordinate', e); // eslint-disable-line no-console
              resolve([]);
            });
          }
        });
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
      const [position] = await this.convertCoordinate([this.positionDepot]);
      if (!this.markerDepot) {
        const AMapUI = await loadAMapUI();
        AMapUI.loadUI(['overlay/SimpleMarker'], SimpleMarker => {
          this.markerDepot = new SimpleMarker({
            iconStyle: 'red',
            iconLabel: '🚉',
            position
          });
          this.map.add(this.markerDepot);
        });
      } else {
        this.markerDepot.setPosition(position);
      }
    },
    async drawMarkerDrone(position) {
      if (this.fit) return;
      if (!this.markerDrone) {
        this.markerDrone = { setPosition() { /* noop */ } };
        const AMapUI = await loadAMapUI();
        AMapUI.loadUI(['overlay/SimpleMarker'], SimpleMarker => {
          this.markerDrone = new SimpleMarker({
            iconStyle: 'red',
            iconLabel: '✈️',
            position
          });
          this.map.add(this.markerDrone);
        });
      } else {
        this.markerDrone.setPosition(position);
      }
    },
    async drawPath() {
      if (this.path.length === 0) {
        if (this.poly) {
          this.poly.setMap(null);
          this.poly = null;
        }
        if (this.markerDrone) {
          this.markerDrone.setMap(null);
          this.markerDrone = null;
        }
        return;
      }
      const { Polyline } = await loadAMap();
      const path = await this.convertCoordinate(this.path);
      this.drawMarkerDrone(path[0]);
      if (this.poly) {
        this.poly.setPath(path);
      } else {
        this.poly = new Polyline({
          map: this.map,
          geodesic: true,
          path: path,
          strokeColor: 'red',
          strokeWeight: 2,
          lineJoin: 'round'
        });
      }
      if (this.fit) {
        this.fitPath();
      } else {
        this.map.setCenter(path[0]);
      }
    },
    async drawNamedMarkers() {
      const [AMap, AMapUI, position] = await Promise.all([
        loadAMap(),
        loadAMapUI(),
        this.convertCoordinate(this.markers.map(m => m.position || { lng: 0, lat: 0 }))
      ]);
      AMapUI.loadUI(['overlay/SimpleMarker'], SimpleMarker => {
        for (let i = 0; i < this.markers.length; i++) {
          const m = this.markers[i];
          if (!m.position) continue;
          let marker = this.namedMarkers[m.id];
          const pos = position[i];
          if (marker) {
            marker.setPosition(pos);
          } else {
            marker = new SimpleMarker({
              iconStyle: 'red',
              iconLabel: m.type === 'depot' ? '🚉' : '✈️',
              position: pos,
              label: {
                content: m.name,
                offset: new AMap.Pixel(25, 30)
              }
            });
            this.$set(this.namedMarkers, m.id, marker);
            this.map.add(marker);
          }
          this.map.setFitView();
        }
      });
    },
    /**
     * 自动缩放地图以适应路径
     */
    fitPath() {
      if (this.poly) {
        this.map.setFitView([this.poly]);
      }
    }
  },
  watch: {
    path() {
      this.drawPath();
    },
    positionDepot() {
      this.drawMarkerDepot();
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
  },
  created() {
    /** @type {AMap.Map} */
    this.map = null;
    /** @type {AMap.Polyline} */
    this.poly = null;
    /** @type {AMap.Marker} */
    this.markerDepot = null;
    /** @type {AMap.Marker} */
    this.markerDrone = null;
    /** @type {{[key: string]: AMap.Marker}} */
    this.namedMarkers = {};
  },
  mounted() {
    this.initMap().then(() => {
      this.drawMarkerDepot();
      this.drawPath();
      this.drawNamedMarkers();
    });
  },
  beforeDestroy() {
    Object.keys(this.namedMarkers).concat('poly', 'markerDepot', 'markerDrone').forEach(prop => {
      if (this[prop]) {
        this[prop].setMap(null);
        this[prop] = null;
      }
    });
    if (this.map) {
      this.map.destroy();
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
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px 0 0 0;
  background: rgb(211, 61, 41);
}
</style>
