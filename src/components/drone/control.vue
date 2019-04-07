<script>
import Control from '@/components/control.vue';

const Controls = [
  {
    icon: 'drone/d_drone',
    item: [
      { name: 'air.air_hover', mission: 'mode_loiter' }
    ]
  },
  {
    icon: 'drone/d_fly',
    item: [
      { name: 'air.air_takeoff', mission: 'take_off' }
    ]
  },
  {
    icon: 'drone/d_return',
    item: [
      { name: 'air.air_return', mission: 'model_rtl' }
    ]
  },
  {
    icon: 'drone/d_task',
    item: [
      { name: 'air.air_runplan', mission: 'readyMsission' }
    ]
  },
  {
    icon: 'drone/d_updown',
    item: [
      { name: 'air.air_up', values: { num: 5 }, mission: 'up_5' },
      { name: 'air.air_down', values: { num: 5 }, mission: 'down_5' }
    ]
  },
  {
    icon: 'drone/d_spare',
    item: [
      { name: 'air.air_landpoint', mission: 'land_bakup' }
    ]
  }
];

export default {
  extends: Control,
  name: 'sd-node-drone-control',
  computed: {
    controls() {
      return Controls;
    }
  }
};
</script>
