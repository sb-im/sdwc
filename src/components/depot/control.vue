<script>
import Control from '@/components/control.vue';

const Controls = [
  {
    icon: 'reset',
    item: [
      { name: 'depot.ctl.stop', mission: 'ncp', arg: ['shell', 'stop'], type: 'danger' },
      { name: 'depot.ctl.reset', mission: 'reset' }
    ]
  },
  {
    icon: 'depot',
    item: [
      { name: 'depot.ctl.dooropen', mission: 'dooropen' },
      { name: 'depot.ctl.doorclose', mission: 'doorclose' }
    ]
  },
  {
    icon: 'battery',
    item: [
      { name: 'depot.ctl.charge_on', mission: 'power_chargedrone_on' },
      { name: 'depot.ctl.charge_off', mission: 'power_chargedrone_off' }
    ]
  },
  {
    icon: 'expand',
    item: [
      { name: 'depot.ctl.fixdrone', mission: 'fixdrone' },
      { name: 'depot.ctl.freedrone', mission: 'freedrone' }
    ]
  },
  {
    icon: 'robot-arm',
    item: [
      { name: 'depot.ctl.pickbattery', mission: 'pickdronebattery' },
      { name: 'depot.ctl.mountbattery', mission: 'mountdronebattery' }
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
