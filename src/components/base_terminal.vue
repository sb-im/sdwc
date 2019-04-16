<script>
import mqttClient from '../config/mqtt';

export default {
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  methods: {
    checkNodeStatus() {
      const { status } = this.$store.state.nodeStatus.find(st => st.id == this.node.id);
      if (status == 0) {
        return true;
      }
      this.$alert(this.$t('common.not_operational'), {
        type: 'warning',
        title: this.$t('common.system_tips'),
        confirmButtonText: this.$t('common.comfirm')
      });
      return false;
    },
    doMsission(name, mission, args = []) {
      if (!this.checkNodeStatus()) return Promise.reject();
      // store reference of notification
      const notification = this.$notify({
        duration: 0,
        type: 'info',
        title: name,
        message: this.$t('common.operate_pending')
      });
      return mqttClient.invoke(this.node.id, mission, args)
        .then(() => {
          // modify notification icon and text
          notification.$data.type = 'success';
          notification.$data.message = this.$t('common.operate_success');
          // disappear after 2000ms
          // @see https://github.com/ElemeFE/element/blob/5ef3d0ec8d02872fc5de51d16ffe36af2700b11c/packages/notification/src/main.js#L11
          notification.$data.duration = 2000;
          notification.startTimer();
        })
        .catch(e => {
          notification.$data.type = 'error';
          notification.$data.message = this.$t('common.operate_error');
          return e;
        });
    },
  }
}
</script>
