<template>
  <div class="drone">
    <sd-drone-status :node="node" :msg="node.msg"></sd-drone-status>
    <template v-for="{ point, compo } of points">
      <component :is="compo" :key="point.id" :point="point" :status="node.status" :msg="node.msg"></component>
      <sd-drone-map
        v-if="compo === 'sd-drone-mointor'"
        :key="`${point.id}_map`"
        :info="node.info"
        :point="point"
        :status="node.status"
        :msg="node.msg"
      ></sd-drone-map>
    </template>
  </div>
</template>

<script>
import Status from './status.vue';
import Control from './control.vue';
import Monitor from './monitor.vue';
import Debug from '@/components/debug.vue';
import Battery from '@/components/battery.vue';
import DroneMap from './map.vue';

const CompoName = {
  'debug': Debug.name,
  'battery': Battery.name,
  'console': Control.name,
  'iframe': Monitor.name,
  'livestream_img': Monitor.name,
  'livestream_flv': Monitor.name,
  'livestream_hls': Monitor.name,
  'livestream_webrtc': Monitor.name,
  'livestream_webrtc2': Monitor.name
};

const CompoOrder = {
  [Monitor.name]: 0,
  [Battery.name]: 5,
  [Control.name]: 9,
  [Debug.name]: 99,
};

export default {
  name: 'sd-node-drone',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  computed: {
    points() {
      return this.node.info.points.map(point => {
        const compo = CompoName[point.point_type_name] || '';
        return { point, compo };
      }).sort((a, b) => CompoOrder[a.compo] - CompoOrder[b.compo]);
    }
  },
  components: {
    [Debug.name]: Debug,
    [Status.name]: Status,
    [Battery.name]: Battery,
    [Control.name]: Control,
    [DroneMap.name]: DroneMap,
    [Monitor.name]: Monitor
  }
};
</script>
