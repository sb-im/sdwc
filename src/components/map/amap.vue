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
      /** @type {AMap.Map} */
      map: null,
      /** @type {AMap.Polyline} */
      poly: null,
      /** @type {AMap.Marker} */
      markerDepot: null,
      /** @type {AMap.Marker} */
      markerDrone: null
    };
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
      if (!this.positionDepot) return;
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
    /**
     * 自动缩放地图以适应路径
     */
    async fitPath() {
      if (this.poly) {
        this.map.setFitView([this.poly]);
      }
    }
  },
  watch: {
    center(val) {
      if (!this.map) return;
      this.map.setCenter(val);
    },
    path() {
      this.drawPath();
    },
    async fit(val) {
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
    ['poly', 'markerDepot', 'markerDrone', 'markerDepot'].forEach(prop => {
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
