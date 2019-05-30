<template>
  <div class="depot">
    <template v-for="{ point, compo } of points">
      <component :is="compo" :key="point.id" :point="point" :status="status" :position="position"></component>
    </template>
    <sd-node-depot-control :node="node" :status="status"></sd-node-depot-control>
  </div>
</template>

<script>
import Control from './control.vue';
import Monitor from '@/components/monitor/monitor.vue';
import Weather from '@/components/weather/weather.vue';

const CompoName = {
  'weather': Weather.name,
  'iframe': Monitor.name,
  'livestream_img': Monitor.name,
  'livestream_flv': Monitor.name,
  'livestream_hls': Monitor.name,
  'livestream_webrtc': Monitor.name
};

export default {
  name: 'sd-node-depot',
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
      });
    }
  },
  components: {
    [Control.name]: Control,
    [Monitor.name]: Monitor,
    [Weather.name]: Weather
  }
};
</script>
