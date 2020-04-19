<template>
  <div class="status__line status__noti">
    <div class="status__label">日志</div>
    <div class="status__body">
      <sd-notification v-if="notification.length > 0" :notification="notification[0]"></sd-notification>
      <span v-else>暂无日志</span>
    </div>
    <el-button-group class="status__buttons">
      <el-button
        :icon="`el-icon-${popup ? 'bell' : 'close-notification'}`"
        :type="popup ? 'primary' : 'default'"
        size="small"
        @click="handlePopup"
      >
        <span>弹出</span>
      </el-button>
      <el-dropdown trigger="click" :hide-on-click="false">
        <el-button type="default" size="small">
          <span>历史</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="status__noti-history">
            <el-dropdown-item v-if="notification.length === 0" disabled>
              <span>暂无日志</span>
            </el-dropdown-item>
            <template v-else>
              <el-dropdown-item v-for="(n, i) of notification" :key="notification.length - i">
                <sd-notification :notification="n"></sd-notification>
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-button-group>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import NotificationItem from './notification.vue';

export default {
  name: 'sd-status-notify',
  props: {
    nodeId: {
      type: Number,
      required: true
    },
    notification: {
      type: Array,
      required: true
    }
  },
  computed: {
    ...mapState(['preference']),
    popup() {
      return this.preference.notifyPopup.includes(this.nodeId);
    }
  },
  methods: {
    ...mapActions(['setPreference']),
    handlePopup() {
      const arr = Array.from(this.preference.notifyPopup);
      if (this.popup) {
        arr.splice(arr.indexOf(this.nodeId), 1);
      } else {
        arr.push(this.nodeId);
      }
      this.setPreference({ notifyPopup: arr });
    }
  },
  components: {
    [NotificationItem.name]: NotificationItem
  }
};
</script>

<style>
/* notification */
.status__noti {
  margin: 0 10px;
  padding: 10px 0;
  align-items: center;
}
.status__label {
  color: #606266;
  flex-shrink: 0;
}
.status__body {
  flex-grow: 1;
  margin: 0 10px;
  white-space: nowrap;
  overflow: hidden;
}
.status__body .sd-notification {
  display: inline-block;
}
.status__buttons {
  flex-shrink: 0;
}
/* fix el-button border of el-dropdown's trigger element in el-button-group */
.status__buttons .el-button--small.el-dropdown-selfdefine {
  border-left-color: #dcdfe6;
}
.status__buttons .el-button--small.el-dropdown-selfdefine:focus,
.status__buttons .el-button--small.el-dropdown-selfdefine:hover {
  border-left-color: #c6e2ff;
}
.status__buttons .el-button--small.el-dropdown-selfdefine:active {
  border-left-color: #3a8ee6;
}
/* end fix */
.status__noti-history {
  min-width: 200px;
  max-width: 75%;
}
.status__noti-history .el-dropdown-menu__item {
  line-height: initial;
  padding: 8px 20px;
}
</style>
