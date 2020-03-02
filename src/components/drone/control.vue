<script>
import Control from '@/components/control.vue';

const Controls = [
  {
    icon: 'drone-blue',
    item: [
      { name: 'air.ctl.hover', mission: 'mode_loiter' }
    ]
  },
  {
    icon: 'takeoff',
    item: [
      { name: 'air.ctl.takeoff', mission: 'take_off' }
    ]
  },
  {
    icon: 'land',
    item: [
      { name: 'air.ctl.return', mission: 'model_rtl' }
    ]
  },
  {
    icon: 'map-waypoint-blue',
    item: [
      { name: 'air.ctl.runplan', mission: 'readyMsission' }
    ]
  },
  {
    icon: 'updown',
    item: [
      { name: 'air.ctl.up', values: { num: 5 }, mission: 'up_5' },
      { name: 'air.ctl.down', values: { num: 5 }, mission: 'down_5' }
    ]
  },
  {
    icon: 'ambulance',
    item: [
      { name: 'air.ctl.land_backup', mission: 'land_bakup' }
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
  },
  methods: {
    readyMission(name) {
      return new Promise((resolve, reject) => {
        // msgbox's reference can't be stored
        this.$msgbox({
          type: 'info',
          title: this.$t(name),
          message: this.$t('control.pending')
        });
        this.$mqtt(this.point.node_id, { mission: 'startmission_ready' })
          .then(() => {
            // 'startmission_ready' returns 'OK'
            this.$msgbox.close();
            this.$confirm(this.$t('air.ctl.plan_ready'), {
              type: 'warning',
              title: this.$t(name)
            }).then(() => {
              // startmission when user confirm
              resolve();
            }).catch(() => {
              reject();
            });
          })
          .catch(e => {
            // 'startmission_ready' failed
            this.$msgbox.close();
            const h = this.$createElement;
            // message can be VNode
            const message = h('div', [
              h('p', this.$t('control.error')),
              h('p', `${e.code}: ${e.message}`)
            ]);
            this.$alert(message, {
              type: 'error',
              title: this.$t(name)
            }).catch(() => { /* noop */ });
            reject();
          });
      });
    },
    handleControl({ name, mission }) {
      if (mission === 'readyMsission') {
        this.readyMission(name).then(() => {
          Control.methods.handleControl.apply(this, arguments);
        }).catch(() => { /* noop */ });
        return;
      }
      Control.methods.handleControl.apply(this, arguments);
    }
  }
};
</script>
