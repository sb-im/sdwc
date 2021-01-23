<template>
  <div class="status-notify-item">
    <span class="status-notify__time" v-text="$d(notification.time * 1000, 'seconds')"></span>
    <span class="status-notify__node" v-if="notification.node" v-text="notification.node"></span>
    <span v-if="hasLevel" class="status-notify__level" :class="level.class" :title="level.name"></span>
    <span v-text="notification.msg"></span>
  </div>
</template>

<script>
import { NodeNotificationLevels } from '@/constants/node-notification-levels';

export default {
  name: 'sd-status-notify-item',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasLevel() {
      return typeof this.notification.level === 'number';
    },
    level() {
      return NodeNotificationLevels[this.notification.level] || {};
    }
  }
};
</script>

<style>
.status-notify-item {
  color: black;
}
.status-notify__time {
  color: #606266;
}
.status-notify__time,
.status-notify__node,
.status-notify__level {
  margin-right: 6px;
}
.status-notify__level.lv0 {
  color: #aa0000;
}
.status-notify__level.lv1 {
  color: #ff0000;
}
.status-notify__level.lv2 {
  color: #fa3737;
}
.status-notify__level.lv3 {
  color: #f56c6c;
}
.status-notify__level.lv4 {
  color: #e6a23c;
}
.status-notify__level.lv5 {
  color: #67c23a;
}
.status-notify__level.lv6 {
  color: #409eff;
}
.status-notify__level.lv7 {
  color: #606266;
}

/* global notification popup */
.status-notify--popup {
  padding: 10px 26px 10px 14px;
}
.status-notify__title {
  color: black;
  font-weight: bold;
}
.status-notify--popup .el-notification__group {
  margin: 0;
}
.status-notify--popup .el-notification__content {
  margin: 0;
}
.status-notify--popup .el-notification__closeBtn {
  top: 10px;
  right: 10px;
}
</style>
