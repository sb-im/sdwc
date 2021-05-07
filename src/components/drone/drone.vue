<template>
  <div class="drone">
    <template v-for="{ point, compo, key } of points">
      <component
        :is="compo"
        :key="key"
        :info="node.info"
        :point="point"
        :status="node.status"
        :msg="node.msg"
      ></component>
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
import Custom from '@/components/custom/custom.vue';
import Settings from '@/components/settings/settings.vue';

const CompoName = {
  'drone_status': Status.name,
  'map': DroneMap.name,
  'debug': Debug.name,
  'battery': Battery.name,
  'custom': Custom.name,
  'console': Control.name,
  'settings': Settings.name,
  'iframe': Monitor.name,
  'livestream_img': Monitor.name,
  'livestream_flv': Monitor.name,
  'livestream_hls': Monitor.name,
  'livestream_webrtc': Monitor.name,
  'livestream_webrtc2': Monitor.name,
  'livestream_webrtc3': Monitor.name,
  'livestream_webrtc4': Monitor.name
};

const CompoOrder = {
  [Status.name]: 0,
  [Monitor.name]: 2,
  [DroneMap.name]: 3,
  [Battery.name]: 5,
  [Custom.name]: 6,
  [Control.name]: 9,
  [Settings.name]: 10,
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
      let i = 0;
      const nodeId = this.node.info.id;
      return this.node.info.points.map(point => {
        const { id, point_type_name } = point;
        const compo = CompoName[point_type_name] || '';
        const key = `${nodeId}-${id}-${point_type_name}-${i++}`;
        return { point, compo, key };
      }).sort((a, b) => CompoOrder[a.compo] - CompoOrder[b.compo]);
    }
  },
  components: {
    [Debug.name]: Debug,
    [Status.name]: Status,
    [Battery.name]: Battery,
    [Custom.name]: Custom,
    [Control.name]: Control,
    [DroneMap.name]: DroneMap,
    [Monitor.name]: Monitor,
    [Settings.name]: Settings
  }
};
</script>
