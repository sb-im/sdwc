<template>
  <el-header class="header">
    <!-- title -->
    <span class="header-title">{{ $t('header.title') }}</span>
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
        <el-dropdown-menu>
          <el-dropdown-item class="notify__clear" command="clear">
            <i class="el-icon-delete"></i>
            <span v-t="'header.notify.clear'"></span>
          </el-dropdown-item>
          <el-dropdown-item v-if="notify.length === 0" disabled divided>
            <span v-t="'header.notify.none'"></span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="n of notify" :key="n.notif.id" class="notify">
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
          <el-dropdown-item command="logout" divided>
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
import { getNodeStatusClass } from '@/constants/node-status-class';
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
      notifyAlert: false
    };
  },
  computed: {
    ...mapState([
      'ui',
      'node',
      'preference',
      'notification'
    ]),
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
    /**
     * @param {{node: number} | {lang: string} | 'logout'|'clear'} cmd
     */
    handleCommand(cmd) {
      if (!cmd) return;
      if (typeof cmd === 'string') {
        switch (cmd) {
          case 'logout':
            this.logout().then(() => {
              this.$router.replace({ name: 'login' });
            });
            break;
          case 'clear':
            this.$store.commit(NOTI.CLEAR_NOTI);
            break;
        }
      } else if (typeof cmd.lang === 'string') {
        this.setPreference(cmd);
      } else if (typeof cmd.node === 'number') {
        this.$router.push({ name: 'node', params: { id: cmd.node } }).catch(() => { /* noop */ });
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
      }
    });
  },
  components: {
    'sd-icon': Icon
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

.notify {
  line-height: 2;
  margin: 4px 0;
}

.notify__clear {
  min-width: 200px;
}

.notify__list {
  max-height: 500px;
  overflow: auto;
  margin-top: 6px;
  border-top: 1px solid #ebeef5;
  padding-bottom: 0;
}

.notify__prefix {
  font-weight: bold;
  font-size: 12px;
}
</style>
