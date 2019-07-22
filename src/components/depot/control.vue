<script>
import Control from '@/components/control.vue';

const Controls = [
  {
    icon: 'reset',
    item: [
      { name: 'depot.emergency_stop', mission: 'ncp', arg: ['shell', 'stop'], type: 'danger' },
      { name: 'depot.air_reset', mission: 'reset' }
    ]
  },
  {
    icon: 'depot',
    item: [
      { name: 'depot.open_door', mission: 'dooropen' },
      { name: 'depot.close_door', mission: 'doorclose' }
    ]
  },
  {
    icon: 'charge',
    item: [
      { name: 'depot.start_charge', mission: 'power_chargedrone_on' },
      { name: 'depot.stop_charge', mission: 'power_chargedrone_off' }
    ]
  },
  {
    icon: 'expand',
    item: [
      { name: 'depot.air_fixed', mission: 'fixdrone' },
      { name: 'depot.air_release', mission: 'freedrone' }
    ]
  },
  {
    icon: 'robot-arm',
    item: [
      { name: 'depot.air_bat_pickout', mission: 'pickdronebattery' },
      { name: 'depot.air_bat_putin', mission: 'mountdronebattery' }
    ]
  }
];

export default {
  extends: Control,
  name: 'sd-node-depot-control',
  computed: {
    controls() {
      return Controls;
    }
  }
};
</script>
