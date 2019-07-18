<template>
  <el-header class="header">
    <!-- title -->
    <span class="header-title">{{ $t('header.title') }}</span>
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
          <el-dropdown-item
            v-for="(value, key) in locales"
            :key="key"
            class="header-dropdown-item"
            :command="{ lang: key }"
          >
            <el-radio :value="preference.lang" :label="key">{{value}}</el-radio>
          </el-dropdown-item>
          <el-dropdown-item class="header-dropdown-item" command="logout" divided>
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
 */
import { mapActions, mapState } from 'vuex';
import { locales } from '@/i18n';
import Icon from '@/components/sd-icon.vue';

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
  computed: {
    ...mapState([
      'node',
      'preference'
    ]),
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
     * @param {{lang: string}|'logout'} cmd
     */
    handleCommand(cmd) {
      if (typeof cmd.lang === 'string') {
        this.setPreference(cmd);
      } else if (cmd === 'logout') {
        this.logout().then(() => {
          this.$router.replace({ name: 'login' });
        });
      }
    }
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

.header-dropdown-item {
  width: 180px;
}
</style>
