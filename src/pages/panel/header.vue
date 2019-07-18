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
        <sd-icon :value="notifyAlert ? 'warning' :'updown'" />
        <span class="header-dropdown-text">{{ $t('header.notify') }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item class="notify__clear" command="clear">
            <i class="el-icon-delete"></i>
            {{ $t('header.notify_clear') }}
          </el-dropdown-item>
          <el-dropdown-item v-if="notify.length === 0" disabled divided>
            <span>{{ $t('header.notify_empty') }}</span>
          </el-dropdown-item>
          <div v-else class="notify__list">
            <el-dropdown-item v-for="n of notify" :key="n.id" class="notify">
              <div class="notify__prefix">{{ n.prefix }} · {{ $d(n.time, 'time') }}</div>
              <div>
                <i class="notify__icon" :class="n.icon" :style="{color: n.color}"></i>
                <span class="notify__title">{{ n.title }}</span>
              </div>
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <!-- node status dropdown -->
    <el-dropdown class="header-dropdown">
      <span class="header-dropdown-content">
        <sd-icon value="link" />
        <span class="header-dropdown-text">{{ $t('header.status') }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="st in status" :key="st.id">
            <router-link tag="span" :to="{name: 'node', params: { id: st.id }}">
              <i :class="st.icon" :style="{color: st.color}"></i>
              <span>{{ st.text }}</span>
            </router-link>
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
            <el-radio :value="preference.lang" :label="key">{{value}}</el-radio>
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <i class="el-icon-back"></i>
            <span>{{ $t('header.logout') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<script>
/**
 * @typedef {import('@/store/modules/node').NodeInfo} NodeInfo
 * @typedef {import('@/store/modules/notification').NotificationItem} NotificationItem
 */
import { mapActions, mapState } from 'vuex';
import { locales } from '@/i18n';
import Icon from '@/components/sd-icon.vue';
import { MutationTypes as NOTI } from '@/store/modules/notification';

const StatusIcon = {
  0: 'el-icon-success',
  1: 'el-icon-info',
  2: 'el-icon-error',
  default: 'el-icon-warning'
};

const StatusColor = {
  0: '#67C23A',
  1: '#909399',
  2: '#F56C6C',
  default: '#E6A23C'
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
      'node',
      'preference',
      'notification'
    ]),
    notify() {
      return this.notification.map(this.notificationToObject);
    },
    status() {
      return this.node.map(node => this.statusToObject(node.info, node.status));
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
     * @param {NotificationItem} n
     */
    notificationToObject(n) {
      const icon = StatusIcon[n.status];
      const color = StatusColor[n.status];
      return { icon, color, ...n };
    },
    /**
     * @param {'air'|depot'} type
     * @returns {string}
     */
    getTypeText(type) {
      switch (type) {
        case 'air': return this.$t('header.air');
        case 'depot': return this.$t('header.depot');
      }
    },
    /**
     * @param {number} status
     * @returns {string}
     */
    getStatusText(status) {
      switch (status) {
        case 0: return this.$t('header.normal');
        case 1: return this.$t('header.shutdown');
        case 2: return this.$t('header.net_error');
        default: return this.$t('header.never_online');
      }
    },
    /**
     * @param {NodeInfo} info node info
     * @param {number} status node status
     * @returns {{id: number, icon: string, color: string, text: string}}
     */
    statusToObject({ id, name, type_name }, status) {
      const icon = StatusIcon[status] || StatusIcon.default;
      const color = StatusColor[status] || StatusColor.default;
      const text = `${this.getTypeText(type_name)} ${name} ${this.getStatusText(status)}`;
      return { id, icon, color, text };
    },
    /**
     * @param {{lang: string}|'logout'|'clear'} cmd
     */
    handleCommand(cmd) {
      if (typeof cmd.lang === 'string') {
        this.setPreference(cmd);
      } else if (cmd === 'logout') {
        this.logout().then(() => {
          this.$router.replace({ name: 'login' });
        });
      } else if (cmd === 'clear') {
        this.$store.commit(NOTI.CLEAR_NOTI);
      }
    }
  },
  created() {
    this.$store.subscribe(({ type, payload }) => {
      if (type === NOTI.MOD_NOTI && payload.status === 2) {
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
