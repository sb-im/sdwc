<template>
  <div class="map__el" ref="map"></div>
</template>

<script>
import { loadAMap, loadAMapUI } from '@/api/amap';
import { MapActionEmoji } from '@/constants/map-actions';

/**
 * @type {AMap.lnglat}
 * store map center across instance
 */
let __AMAP_CENTER__;

/**
 * @type {number}
 * store zoom level across instance
 */
let __AMAP_ZOOM__;

export default {
  name: 'sd-map-amap',
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
      const AMap = await loadAMap();
      const center = this.center || __AMAP_CENTER__ || { lat: 30, lng: 120 };
      this.map = new AMap.Map(this.$refs.map, {
        zoom: __AMAP_ZOOM__ || 20,
        zooms: [3, 20],
        expandZoomRange: true,
        jogEnable: false,
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
      if (lnglat.length <= 0) return Promise.resolve([]);
      return new Promise((resolve, reject) => {
        loadAMap().then(AMap => {
          if (lnglat.length <= 40) {
            AMap.convertFrom(lnglat.map(p => [p.lng, p.lat]), 'gps', (status, result) => {
              if (result.info === 'ok') {
                resolve(result.locations);
              } else {
                console.error('convertCoordinate', lnglat, status, result); // eslint-disable-line no-console
                reject({ status, result });
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
              reject(e);
            });
          }
        });
      });
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
          geodesic: true,
          path: path,
          strokeColor: 'red',
          strokeWeight: 2,
          lineJoin: 'round'
        });
      }
      if (this.fit) {
        this.fitPath();
      } else if (this.follow) {
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
          const marker = this.markers[i];
          if (!marker.position) continue;
          /** @type {AMap.Marker} */
          let mapMarker = this.namedMarkers[marker.id];
          const pos = position[i];
          if (mapMarker) {
            // marker has been created
            mapMarker.setPosition(pos);
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
                iconLabel: '🚉',
                position: pos,
                label: {
                  content: marker.name,
                  offset: { x: 25, y: 30 }
                }
              });
            } else if (marker.type === 'drone') {
              const img = document.createElement('img');
              img.src = '/assets/icons/drone-marker-amap.svg';
              img.style.transform = `rotate(${marker.heading}deg)`;
              mapMarker = new AMap.Marker({
                content: img,
                offset: { x: -20, y: -20 },
                position: pos,
                extData: {
                  img,
                  heading: marker.heading
                },
                label: {
                  content: marker.name,
                  offset: { x: 25, y: 30 }
                }
              });
            } else if (marker.type === 'action') {
              mapMarker = new AMap.Marker({
                content: `<div class="amap-marker--action">${marker.action.map(a => MapActionEmoji[a]).join('')}</div>`,
                position: pos,
                offset: new AMap.Pixel(-11, -11)
              });
            }
            this.namedMarkers[marker.id] = mapMarker;
            this.map.add(mapMarker);
          }
          if (this.fit) {
            this.map.setFitView(null, false, [8, 8, 8, 8], 20);
          }
        }
      });
    },
    /**
     * 自动缩放地图以适应路径
     */
    fitPath() {
      if (this.poly) {
        this.map.setFitView([this.poly], false, [8, 8, 8, 8], 20);
      }
    }
  },
  watch: {
    path() {
      this.drawPath();
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
      if (!this.poly) return;
      const path = this.poly.getPath();
      if (!path.length <= 0) return;
      this.map.setCenter(path[0]);
    }
  },
  created() {
    /** @type {AMap.Map} */
    this.map = null;
    /** @type {AMap.Polyline} */
    this.poly = null;
    /** @type {{[key: string]: AMap.Marker}} */
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
      __AMAP_CENTER__ = this.map.getCenter();
      __AMAP_ZOOM__ = this.map.getZoom();
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
  border: 1px solid #a83121;
  border-radius: 10px 0 0 0;
  background: #d33d29;
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
  background: rgba(211, 61, 41, 0.5);
  opacity: 0.8;
  transition: background-color 0.3s;
}
.amap-marker--action:hover {
  background: rgba(211, 61, 41, 1);
  opacity: 1;
}
</style>
