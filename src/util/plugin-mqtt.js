import Vue from 'vue';
import MqttClient from '@/api/mqtt';

/**
 * @this {Vue}
 * @param {number} id
 * @param {SDWC.ControlItem} ctl
 */
async function mqtt(id, { name, values, mission, arg = [] }) {
  const node = this.$store.state.node.info.find(n => n.id === id);
  if (!node) {
    this.$notify({
      duration: 0,
      type: 'error',
      title: `node#${id} : ${this.$t(name, values)}`,
      message: 'ERR: NO_SUCH_NODE'
    });
    return;
  }
  const notification = this.$notify({
    duration: 0,
    type: 'info',
    title: `${node.name} : ${this.$t(name, values)}`,
    message: this.$t('common.operate_pending')
  });
  try {
    const res = await MqttClient.invoke(id, mission, arg);
    notification.$data.type = 'success';
    notification.$data.message = this.$t('common.operate_success');
    notification.$data.duration = 2000;
    notification.startTimer();
    return res;
  } catch (err) {
    notification.$data.type = 'error';
    notification.$data.message = this.$t('common.operate_error');
    throw err;
  }
}

Vue.use({
  install(Vue) {
    Vue.prototype.$mqtt = mqtt;
  }
});
