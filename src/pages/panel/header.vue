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
            <el-switch :value="preference.planDialogPopup"></el-switch>
          </el-dropdown-item>
          <el-dropdown-item v-if="dialog.length === 0" disabled divided>
            <span v-t="'common.none'"></span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="d of dialog" :key="d.id" :command="{ dialog: d.id }">
              <div class="notify__prefix">{{ d.prefix }}</div>
              <div>
                <i class="notify__icon" :class="d.icon"></i>
                <span class="notify__title">{{ d.title }}</span>
              </div>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <sd-plan-dialog ref="planDialog" :planId="planDialog.id"></sd-plan-dialog>
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
          <el-dropdown-item class="notify__toggle" :command="{ notify: 'popup' }">
            <span v-t="'header.action.popup'"></span>
            <el-switch :value="preference.rpcMsgPopup"></el-switch>
          </el-dropdown-item>
          <el-dropdown-item :command="{ notify: 'clear' }">
            <i class="el-icon-delete"></i>
            <span v-t="'common.clear'"></span>
          </el-dropdown-item>
          <el-dropdown-item v-if="notify.length === 0" disabled divided>
            <span v-t="'common.none'"></span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="n of notify" :key="n.id">
              <div class="notify__prefix">{{ n.prefix }}</div>
              <div>
                <i class="notify__icon" :class="n.icon"></i>
                <span class="notify__title">{{ n.title }}</span>
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
        <el-dropdown-menu class="notify__menu">
          <el-dropdown-item v-if="ui.mqttConnected">
            <i class="el-icon-sort"></i>
            <span v-t="{ path: 'header.network.delay', args: { delay: ui.mqttDelay } }"></span>
          </el-dropdown-item>
          <el-dropdown-item v-else disalbed>
            <span v-t="'common.status.-1'"></span>
          </el-dropdown-item>
          <el-dropdown-item v-if="status.length === 0" disabled divided>
            <span v-t="'common.none'"></span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="s of status" :key="s.id" :command="{ node: s.id }">
              <div class="notify__prefix">{{ s.prefix }}</div>
              <div>
                <i class="notify__icon" :class="s.icon"></i>
                <span class="notify__title">{{ s.title }}</span>
              </div>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- user info dropdown -->
    <el-dropdown class="header-dropdown" @command="handleCommand">
      <span class="header-dropdown-content">
        <sd-icon value="user" />
        <span>{{ user.email }}</span>
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
import PlanDialog from '@/components/plan-dialog/plan-dialog.vue';

import { RpcStatusClass } from '@/constants/rpc-status-class';
import { PlanDialogLevelClass } from '@/constants/plan-dialog-level-class';
import { NodeStatusClass } from '@/constants/node-status-class';

import { MutationTypes as PLAN } from '@/store/modules/plan';
import { MutationTypes as NOTI } from '@/store/modules/notification';

export default {
  name: 'sd-header',
  data() {
    return {
      planDialog: {
        id: -1
      },
      planNotify: {},
      notifyAlert: false
    };
  },
  computed: {
    ...mapState([
      'node',
      'notification',
      'plan',
      'preference',
      'ui',
      'user'
    ]),
    dialog() {
      /** @type {SDWC.PlanDialog[]} */
      const dialog = this.plan.dialog;
      return dialog.map(d => {
        /** @type {SDWC.PlanInfo} */
        const plan = this.plan.info.find(p => p.id === d.id) || {};
        const prefix = `${plan.name || d.id} · ${this.$d(d.time, 'time')}`;
        const icon = PlanDialogLevelClass[d.dialog.level] || PlanDialogLevelClass.unknown;
        return { id: d.id, prefix, icon, title: d.dialog.name };
      });
    },
    notify() {
      /** @type {SDWC.NotificationItem[]} */
      const notification = this.notification;
      return notification.map(n => {
        const prefix = `${n.prefix} · ${this.$d(n.time, 'time')}`;
        const icon = RpcStatusClass[n.status] || RpcStatusClass.default;
        return { id: n.id, prefix, icon, title: n.title };
      });
    },
    status() {
      /** @type {SDWC.Node[]} */
      const nodes = this.node;
      return nodes.map(n => {
        const icon = NodeStatusClass[n.status.code];
        const typeText = this.$t(`common.${n.info.type_name}`);
        const prefix = `${typeText} ${n.info.name}`;
        let title = this.$t(`common.status.${n.status.code}`);
        if (n.status.code === 0) {
          const lossText = this.$t('header.network.loss', n.network);
          const timeText = this.$t('header.network.delay', n.network);
          title += ` | ${lossText} | ${timeText}`;
        }
        return { id: n.info.id, prefix, icon, title };
      });
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
    handlePlanDialogPopup() {
      this.setPreference({ planDialogPopup: !this.preference.planDialogPopup });
    },
    handleRpcMsgPopup() {
      this.setPreference({ rpcMsgPopup: !this.preference.rpcMsgPopup });
    },
    handleNotifyVisible(visible) {
      if (visible === true) {
        this.notifyAlert = false;
      }
    },
    handleCommand(cmd) {
      if (!cmd) return;
      if (typeof cmd.user === 'string') {
        switch (cmd.user) {
          case 'logout':
            this.$message.closeAll();
            // eslint-disable-next-line no-case-declarations
            let msg = this.$message({
              customClass: 'el-message--info',
              iconClass: 'el-message__icon el-icon-loading',
              message: this.$t('header.logout'),
              offset: 6,
              duration: 0,
              onClose: () => msg = null
            });
            this.logout().then(() => {
              msg.close();
              this.$router.replace({ name: 'login' });
            }).catch(e => {
              Object.assign(msg.$data, {
                type: 'error',
                iconClass: '',
                message: e.toString(),
                duration: 4500,
              });
              msg.startTimer();
            });
            break;
        }
      } else if (typeof cmd.lang === 'string') {
        this.setPreference(cmd);
      } else if (typeof cmd.node === 'number') {
        this.$router.push({ name: 'node', params: { id: cmd.node } }).catch(() => { /* noop */ });
      } else if (typeof cmd.notify === 'string') {
        switch (cmd.notify) {
          case 'popup':
            this.handleRpcMsgPopup();
            break;
          case 'clear':
            this.$store.commit(NOTI.CLEAR_NOTI);
            break;
        }
      } else if (typeof cmd.dialog === 'number') {
        this.planDialog.id = cmd.dialog;
        this.$refs.planDialog.open();
      } else if (typeof cmd.dialog === 'string') {
        switch (cmd.dialog) {
          case 'popup':
            this.handlePlanDialogPopup();
            break;
        }
      }
    },
    openPlanDialog(id) {
      if (this.plan.dialog.findIndex(d => d.id === id) < 0) return;
      this.planDialog.id = id;
      if (this.$refs.planDialog.visible) return;
      this.$nextTick(() => this.$refs.planDialog.open());
    },
    closePlanNotify(id) {
      const notifyInstance = this.planNotify[id];
      if (!notifyInstance) return;
      notifyInstance.close();
    },
    /**
     * @param {number} id plan id
     * @param {SDWC.PlanDialogContent} dialog dialog content
     */
    triggerPlanNotify(id, dialog) {
      const plan = this.plan.info.find(p => p.id === id) || { name: `Plan#${id}` };
      if (this.planNotify[id]) {
        this.closePlanNotify(id);
      }
      const n = this.$notify({
        offset: 50,
        message: 'REPLACED_BY_VNODE',
        customClass: 'status-notify--popup',
        onClick: () => {
          this.openPlanDialog(id);
          this.closePlanNotify(id);
        },
        onClose: () => {
          delete this.planNotify[id];
        }
      });
      this.planNotify[id] = n;
      const h = this.$createElement;
      n.$slots.default = [
        h('div', null, [
          h('span', { class: 'status-notify__title' }, [plan.name]),
          h('span', null, [' · ', this.$d(Date.now(), 'seconds')]),
        ]),
        h('i', { class: PlanDialogLevelClass[dialog.level] || PlanDialogLevelClass.unknown }),
        h('span', null, [' ', dialog.name])
      ];
    }
  },
  created() {
    this._unsub = this.$store.subscribe(({ type, payload }, state) => {
      switch (type) {
        case NOTI.MOD_NOTI:
          if (
            payload.status === 2 &&
            state.notification.findIndex(n => n.id === payload.id) >= 0
          ) {
            this.notifyAlert = true;
          }
          break;
        case PLAN.ADD_PLAN_MSG:
          if (typeof payload.dialog !== 'object') return;
          if (Object.getOwnPropertyNames(payload.dialog).length > 0) {
            // dialog not empty
            this.triggerPlanNotify(payload.id, payload.dialog);
            if (this.preference.planDialogPopup && !this.$refs.planDialog.visible) {
              this.openPlanDialog(payload.id);
            }
          } else {
            // dialog is empty
            if (this.planDialog.id === payload.id && this.$refs.planDialog.visible) {
              // opening dialog became empty
              this.$refs.planDialog.close();
            }
            this.closePlanNotify(payload.id);
          }
          break;
      }
    });
  },
  beforeDestroy() {
    if (typeof this._unsub === 'function') {
      this._unsub();
    }
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
