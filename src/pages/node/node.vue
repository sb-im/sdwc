<template>
  <div class="node" v-loading="points.length === 0">
    <template v-for="{ node, point, compo, key } of points">
      <component
        :is="compo"
        :key="key"
        :info="node.info"
        :point="point"
        :status="node.status"
        :msg="node.msg"
        v-bind="$attrs"
      ></component>
    </template>
  </div>
</template>

<script>
import DepotStatus from '@/components/status/depot-status.vue';
import DroneStatus from '@/components/status/drone-status.vue';
import Control from '@/components/control.vue';
import Monitor from '@/components/monitor/node-monitor.vue';
import Debug from '@/components/debug.vue';
import Battery from '@/components/battery.vue';
import NodeMap from '@/components/map/node-map.vue';
import Weather from '@/components/weather/weather.vue';
import Custom from '@/components/custom/custom.vue';
import Settings from '@/components/settings/settings.vue';
import Speaker from '@/components/speaker/speaker.vue';

const CompoName = {
  'depot_status': DepotStatus.name,
  'drone_status': DroneStatus.name,
  'map': NodeMap.name,
  'debug': Debug.name,
  'weather': Weather.name,
  'battery': Battery.name,
  'custom': Custom.name,
  'console': Control.name,
  'settings': Settings.name,
  'speaker': Speaker.name,
  'iframe': Monitor.name,
  'livestream_img': Monitor.name,
  'livestream_flv': Monitor.name,
  'livestream_hls': Monitor.name,
  'livestream_webrtc': Monitor.name,
  'livestream_webrtc2': Monitor.name,
  'livestream_webrtc3': Monitor.name,
  'livestream_webrtc4': Monitor.name,
  'livestream_webrtc_srs': Monitor.name
};

const CompoOrder = {
  [DepotStatus.name]: 0,
  [DroneStatus.name]: 1,
  [Monitor.name]: 2,
  [NodeMap.name]: 3,
  [Speaker.name]: 4,
  [Weather.name]: 5,
  [Control.name]: 9,
  [Settings.name]: 10,
  [Custom.name]: 20,
  [Battery.name]: 30,
  [Debug.name]: 99,
};

/**
 * @typedef {{ node: SDWC.Node, point: SDWC.NodePoint, compo: string, key: string }} PointComponent
 */

export default {
  name: 'sd-node',
  props: {
    id: {
      type: String,
      required: true
    },
    /** @type {Vue.PropOptions<SDWC.NodePoint>} */
    point: {
      type: Object,
      required: false
    }
  },
  computed: {
    /** @returns {SDWC.Node[]} */
    nodes() { return this.$store.state.node; },
    /** @returns {SDWC.Node} */
    node() { return this.nodes.find(node => node.info.id === this.id); },
    /** @returns {PointComponent[]} */
    points() {
      if (!this.node) return [];
      /** @type {SDWC.NodePoint[]} */
      let points = [];
      if (this.point) {
        points.push(this.point);
      } else {
        points = this.node.info.points;
      }
      return points.map((point, index) => {
        const { node_id = '', type } = point;
        const node = this.nodes.find(n => n.info.id === node_id) ?? this.node;
        const compo = CompoName[type] || '';
        const key = `${node_id}-${type}-${index}`;
        return { node, point, compo, key };
      }).sort((a, b) => CompoOrder[a.compo] - CompoOrder[b.compo]);
    }
  },
  components: {
    [Debug.name]: Debug,
    [DepotStatus.name]: DepotStatus,
    [DroneStatus.name]: DroneStatus,
    [Battery.name]: Battery,
    [Custom.name]: Custom,
    [Control.name]: Control,
    [NodeMap.name]: NodeMap,
    [Monitor.name]: Monitor,
    [Weather.name]: Weather,
    [Settings.name]: Settings,
    [Speaker.name]: Speaker
  }
};
</script>
