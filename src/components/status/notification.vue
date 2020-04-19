<template>
  <div class="sd-notification">
    <span class="sd-notification__time" v-text="$d(notification.time * 1000, 'seconds')"></span>
    <span
      class="sd-notification__level"
      :class="`lv${notification.level}`"
      v-text="` [${Levels[notification.level]}] `"
    ></span>
    <span v-text="notification.msg"></span>
  </div>
</template>

<script>
import { Levels } from '@/constants/notification-levels';

export default {
  name: 'sd-notification',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  created() {
    this.Levels = Levels;
  }
};
</script>

<style>
.sd-notification {
  color: black;
}
.sd-notification__time {
  color: #606266;
}
.sd-notification__level.lv0 {
  color: #aa0000;
}
.sd-notification__level.lv1 {
  color: #ff0000;
}
.sd-notification__level.lv2 {
  color: #fa3737;
}
.sd-notification__level.lv3 {
  color: #f56c6c;
}
.sd-notification__level.lv4 {
  color: #e6a23c;
}
.sd-notification__level.lv5 {
  color: #67c23a;
}
.sd-notification__level.lv6 {
  color: #409eff;
}
.sd-notification__level.lv7 {
  color: #606266;
}

/* global notification popup */
.sd-notification--popup {
  padding: 10px 26px 10px 14px;
}
.sd-notification__title {
  color: black;
  font-weight: bold;
}
.sd-notification--popup .el-notification__group {
  margin: 0;
}
.sd-notification--popup .el-notification__content {
  margin: 0;
}
.sd-notification--popup .el-notification__closeBtn {
  top: 10px;
  right: 10px;
}
</style>
