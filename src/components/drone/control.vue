<script>
import MqttClient from '@/api/mqtt';
import Control from '@/components/control.vue';

const Controls = [
  {
    icon: 'drone',
    item: [
      { name: 'air.air_hover', mission: 'mode_loiter' }
    ]
  },
  {
    icon: 'takeoff',
    item: [
      { name: 'air.air_takeoff', mission: 'take_off' }
    ]
  },
  {
    icon: 'land',
    item: [
      { name: 'air.air_return', mission: 'model_rtl' }
    ]
  },
  {
    icon: 'map',
    item: [
      { name: 'air.air_runplan', mission: 'readyMsission' }
    ]
  },
  {
    icon: 'updown',
    item: [
      { name: 'air.air_up', values: { num: 5 }, mission: 'up_5' },
      { name: 'air.air_down', values: { num: 5 }, mission: 'down_5' }
    ]
  },
  {
    icon: 'ambulance',
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
  },
  methods: {
    readyMission(name) {
      return new Promise((resolve, reject) => {
        // msgbox's reference can't be stored
        this.$msgbox({
          type: 'info',
          title: this.$t(name),
          message: this.$t('common.operate_pending')
        });
        MqttClient.invoke(this.node.id, 'startmission_ready', [])
          .then(() => {
            // 'startmission_ready' returns 'OK'
            this.$msgbox.close();
            this.$confirm(this.$t('common.plan_ready'), {
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
              h('p', this.$t('common.operate_error')),
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
