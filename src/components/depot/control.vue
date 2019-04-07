<script>
import Control from '@/components/control.vue';

const Controls = [
  {
    icon: 'airport/a_reset',
    item: [
      { name: 'depot.emergency_stop', mission: 'stop', type: 'danger' },
      { name: 'depot.air_reset', mission: 'reset' }
    ]
  },
  {
    icon: 'airport/a_airport',
    item: [
      { name: 'depot.open_door', mission: 'dooropen' },
      { name: 'depot.close_door', mission: 'doorclose' }
    ]
  },
  {
    icon: 'airport/a_charge',
    item: [
      { name: 'depot.start_charge', mission: 'power_chargedrone_on' },
      { name: 'depot.stop_charge', mission: 'power_chargedrone_off' }
    ]
  },
  {
    icon: 'airport/a_fixed',
    item: [
      { name: 'depot.air_fixed', mission: 'fixdrone' },
      { name: 'depot.air_release', mission: 'freedrone' }
    ]
  },
  {
    icon: 'airport/a_get',
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
