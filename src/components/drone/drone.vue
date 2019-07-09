<template>
  <div class="drone">
    <sd-node-drone-status :node="node" :msg="msg"></sd-node-drone-status>
    <template v-for="{ point, compo } of points">
      <component :is="compo" :key="point.id" :point="point" :status="status"></component>
      <sd-map
        v-if="compo === 'sd-node-mointor-drone'"
        :key="`${point.id}_map`"
        :point="node"
        :path="path"
      ></sd-map>
    </template>
  </div>
</template>

<script>
import Status from './status.vue';
import Control from './control.vue';
import Monitor from './monitor.vue';
import Debug from '@/components/debug.vue';
import NodeMap from '@/components/map/map.vue';

const CompoName = {
  'debug': Debug.name,
  'console': Control.name,
  'iframe': Monitor.name,
  'livestream_img': Monitor.name,
  'livestream_flv': Monitor.name,
  'livestream_hls': Monitor.name,
  'livestream_webrtc': Monitor.name
};

const CompoOrder = {
  [Monitor.name]: 0,
  [Control.name]: 9,
  [Debug.name]: 99,
};

export default {
  name: 'sd-node-drone',
  props: {
    node: {
      type: Object,
      required: true
    },
    status: {
      type: Number,
      required: true
    },
    msg: {
      type: Object,
      required: true
    },
    log: {
      type: Array,
      required: true
    },
    position: {
      type: Object,
      required: false
    },
    path: {
      type: Array,
      required: false
    }
  },
  computed: {
    points() {
      return this.node.points.map(point => {
        const compo = CompoName[point.point_type_name] || '';
        return { point, compo };
      }).sort((a, b) => CompoOrder[a.compo] - CompoOrder[b.compo]);
    }
  },
  components: {
    [Debug.name]: Debug,
    [Status.name]: Status,
    [Control.name]: Control,
    [NodeMap.name]: NodeMap,
    [Monitor.name]: Monitor
  }
};
</script>
