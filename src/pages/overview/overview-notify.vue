<template>
  <div class="el-card sd-card">
    <sd-status-notify :notification="notification" :canPopup="false"></sd-status-notify>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import StatusNotify from '@/components/status/status-notify.vue';

export default {
  name: 'sd-overview-notify',
  computed: {
    ...mapState([
      'node'
    ]),
    notification() {
      const result = [];
      for (const node of this.node) {
        for (const n of node.msg.notification) {
          result.push({ ...n, node: node.info.name });
        }
      }
      result.sort((a, b) => b.time - a.time);
      return result.slice(0, 15);
    }
  },
  components: {
    [StatusNotify.name]: StatusNotify
  }
};
</script>

<style>
/* fix overview page overflow if prefered font is too tall */
.sd-overview .status__buttons .el-button--small {
  height: 32px;
  padding: 0 15px;
}
</style>
