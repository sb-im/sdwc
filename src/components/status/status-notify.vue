<template>
  <div class="status__line status__noti">
    <div class="status__label" v-t="'status.log'"></div>
    <div class="status__body">
      <sd-notification v-if="notification.length > 0" :notification="notification[0]"></sd-notification>
      <span v-else v-t="'status.no_log'"></span>
    </div>
    <el-popover
      class="status__buttons"
      popper-class="status__noti-history"
      trigger="manual"
      placement="bottom-end"
      :value="historyShown"
    >
      <el-button-group slot="reference">
        <el-button
          :icon="`el-icon-${popup ? 'bell' : 'close-notification'}`"
          :type="popup ? 'primary' : 'default'"
          size="small"
          @click="handlePopup"
        >
          <span v-t="'status.popup'"></span>
        </el-button>
        <el-button type="default" size="small" @click="handleHistory">
          <span v-t="'status.history'"></span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
      </el-button-group>
      <template>
        <el-dropdown-item v-if="notification.length === 0" disabled>
          <span v-t="'status.no_log'"></span>
        </el-dropdown-item>
        <template v-else>
          <el-dropdown-item v-for="(n, i) of notification" :key="notification.length - i">
            <sd-notification :notification="n"></sd-notification>
          </el-dropdown-item>
        </template>
      </template>
    </el-popover>
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
  data() {
    return {
      historyShown: false
    };
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
    },
    handleHistory() {
      this.historyShown = !this.historyShown;
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
.status__noti-history {
  padding: 10px 0;
  min-width: 200px;
  max-width: 75%;
}
.status__noti-history .el-dropdown-menu__item {
  line-height: initial;
  padding: 8px 20px;
}
</style>
