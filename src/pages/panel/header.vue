<template>
  <el-header class="header">
    <!-- title -->
    <span class="header-title">{{ $t('header.title') }}</span>
    <!-- plan dialog dropdown -->
    <el-dropdown
      class="header-dropdown"
      :hide-on-click="false"
      @command="handleCommand"
      @visible-change="handleNotifyVisible"
    >
      <span class="header-dropdown-content">
        <el-badge :value="dialog.length" :hidden="dialog.length === 0">
          <sd-icon value="control-panel" />
        </el-badge>
        <span class="header-dropdown-text" v-t="'header.action.title'"></span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu class="notify__menu">
          <el-dropdown-item class="notify__toggle" :command="{ dialog: 'popup' }">
            <span v-t="'header.action.popup'"></span>
            <el-switch v-model="planDialog.popup"></el-switch>
          </el-dropdown-item>
          <el-dropdown-item v-if="dialog.length === 0" disabled divided>
            <span v-t="'common.none'"></span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="d of dialog" :key="d.id" :command="{ dialog: d.id }">
              <div class="notify__prefix">{{ d.prefix }} · {{ $d(d.time, 'time') }}</div>
              <div>
                <i class="notify__icon" :class="d.icon"></i>
                <span class="notify__title">{{ d.text }}</span>
              </div>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <sd-preflight ref="planDialog" :planId="planDialog.id"></sd-preflight>
    <!-- notification dropdown -->
    <el-dropdown
      class="header-dropdown"
      :hide-on-click="false"
      @command="handleCommand"
      @visible-change="handleNotifyVisible"
    >
      <span class="header-dropdown-content">
        <sd-icon :value="notifyAlert ? 'warning' :'trumpet'" />
        <span class="header-dropdown-text" v-t="'header.notify.title'"></span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu class="notify__menu">
          <el-dropdown-item :command="{ notify: 'clear' }">
            <i class="el-icon-delete"></i>
            <span v-t="'common.clear'"></span>
          </el-dropdown-item>
          <el-dropdown-item v-if="notify.length === 0" disabled divided>
            <span v-t="'common.none'"></span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="n of notify" :key="n.notif.id">
              <div class="notify__prefix">{{ n.notif.prefix }} · {{ $d(n.notif.time, 'time') }}</div>
              <div>
                <i class="notify__icon" :class="n.icon"></i>
                <span class="notify__title">{{ n.notif.title }}</span>
              </div>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- node status dropdown -->
    <el-dropdown class="header-dropdown" @command="handleCommand">
      <span class="header-dropdown-content">
        <sd-icon :value="`${ui.mqttConnected ? '' : 'dis'}connected`" />
        <span class="header-dropdown-text" v-t="'header.status.title'"></span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="st in status" :key="st.id" :command="{ node: st.id }">
            <i :class="st.icon"></i>
            <span>{{ st.text }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- user info dropdown -->
    <el-dropdown class="header-dropdown" @command="handleCommand">
      <span class="header-dropdown-content">
        <sd-icon value="user" />
        <span>{{ $store.state.user.email }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(value, key) in locales" :key="key" :command="{ lang: key }">
            <el-radio :value="preference.lang" :label="key">{{ value }}</el-radio>
          </el-dropdown-item>
          <el-dropdown-item divided :command="{ user: 'logout' }">
            <i class="el-icon-back"></i>
            <span v-t="'header.logout'"></span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { locales } from '@/i18n';

import Icon from '@/components/sd-icon.vue';
import PlanDialog from '@/components/preflight/preflight2.vue';

import { getLevelIconClass } from '@/constants/level-icon-class';
import { getNodeStatusClass } from '@/constants/node-status-class';

import { MutationTypes as PLAN } from '@/store/modules/plan';
import { MutationTypes as NOTI } from '@/store/modules/notification';

const NotificationClass = {
  0: 'el-icon-success color--green',
  1: 'el-icon-question color--grey',
  2: 'el-icon-error color--red',
  3: 'el-icon-info color--blue',
  default: 'el-icon-warning color--orange'
};

export default {
  name: 'sd-header',
  data() {
    return {
      planDialog: {
        id: -1,
        popup: false
      },
      notifyAlert: false
    };
  },
  computed: {
    ...mapState([
      'ui',
      'node',
      'plan',
      'preference',
      'notification'
    ]),
    dialog() {
      return this.plan.dialog.map(this.planDialogToObject);
    },
    notify() {
      return this.notification.map(this.notificationToObject);
    },
    status() {
      return this.node.map(node => this.statusToObject(node.info, node.status.code));
    },
    locales() {
      return locales;
    }
  },
  methods: {
    ...mapActions([
      'logout',
      'setPreference'
    ]),
    handleNotifyVisible(visible) {
      if (visible === true) {
        this.notifyAlert = false;
      }
    },
    /**
     * @param {SDWC.PlanDialog} dialog
     */
    planDialogToObject({ id, time, dialog }) {
      const plan = this.plan.info.find(p => p.id === id) || {};
      const prefix = plan.name || id;
      const icon = getLevelIconClass(dialog.level);
      return { id, time, icon, prefix, text: dialog.name };
    },
    /**
     * @param {SDWC.NotificationItem} notif
     */
    notificationToObject(notif) {
      const icon = NotificationClass[notif.status] || NotificationClass.default;
      return { icon, notif };
    },
    /**
     * @param {SDWC.NodeInfo} info node info
     * @param {number} status node status
     * @returns {{id: number, icon: string, color: string, text: string}}
     */
    statusToObject({ id, name, type_name }, status) {
      const icon = getNodeStatusClass(status);
      const type = this.$t(`common.${type_name}`);
      const st = this.$t(`common.status.${status}`);
      const text = `${type} ${name} ${st}`;
      return { id, icon, text };
    },
    handleCommand(cmd) {
      if (typeof cmd.user === 'string') {
        switch (cmd) {
          case 'logout':
            this.logout().then(() => {
              this.$router.replace({ name: 'login' });
            });
            break;
        }
      } else if (typeof cmd.lang === 'string') {
        this.setPreference(cmd);
      } else if (typeof cmd.node === 'number') {
        this.$router.push({ name: 'node', params: { id: cmd.node } }).catch(() => { /* noop */ });
      } else if (typeof cmd.notify === 'string') {
        switch (cmd.notify) {
          case 'clear':
            this.$store.commit(NOTI.CLEAR_NOTI);
            break;
        }
      } else if (typeof cmd.dialog === 'number') {
        this.planDialog.id = cmd.dialog;
        this.$refs.planDialog.toggle();
      } else if (typeof cmd.dialog === 'string') {
        switch (cmd.dialog) {
          case 'popup':
            this.planDialog.popup = !this.planDialog.popup;
            break;
        }
      }
    }
  },
  created() {
    this.$store.subscribe(({ type, payload }, state) => {
      if (
        type === NOTI.MOD_NOTI &&
        payload.status === 2 &&
        state.notification.findIndex(n => n.id === payload.id) >= 0
      ) {
        this.notifyAlert = true;
      } else if (
        type === PLAN.ADD_PLAN_MSG &&
        typeof payload.dialog === 'object' &&
        Object.getOwnPropertyNames(payload.dialog).length > 0
      ) {
        if (this.planDialog.popup && !this.$refs.planDialog.visible) {
          this.planDialog.id = payload.id;
          this.$nextTick(() => this.$refs.planDialog.toggle());
        }
      }
    });
  },
  components: {
    [Icon.name]: Icon,
    [PlanDialog.name]: PlanDialog
  }
};
</script>

<style>
.header {
  background-color: #545c64;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
}

.header-title {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: auto;
}

.header-dropdown {
  padding: 0 14px;
  cursor: pointer;
  height: 100%;
  transition: background-color 0.3s;
}

.header-dropdown:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.header-dropdown-content {
  color: white;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-dropdown-text {
  margin-left: 5px;
}

.notify__menu {
  min-width: 240px;
}

.notify__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notify__list {
  max-height: 500px;
  overflow: auto;
  margin-top: 6px;
  border-top: 1px solid #ebeef5;
  padding-bottom: 0;
}

.notify__list .el-dropdown-menu__item {
  line-height: 2;
  margin: 4px 0;
}

.notify__prefix {
  font-weight: bold;
  font-size: 12px;
}
</style>
