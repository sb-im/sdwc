<template>
  <el-header class="header">
    <!-- title -->
    <span class="header-title">{{ $t('header.title') }}</span>
    <!-- node status dropdown -->
    <el-dropdown class="header-dropdown">
      <span class="header-dropdown-content">
        <sd-icon value="header/h_drone"/>
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
        <sd-icon value="header/user"/>
        <span>{{ $store.state.user.email }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item class="header-dropdown-item" command="logout">
            <i class="el-icon-back"></i>
            <span>{{ $t('header.logout') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-header>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Icon from '../../components/sd-icon.vue';

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
    ...mapState({
      nodeInfo: state => state.node.info,
      nodeStatus: state => state.node.status
    }),
    status() {
      return this.nodeInfo.map(node => {
        const status = this.nodeStatus.find(st => st.id === node.id);
        return this.statusToObject(node, status);
      });
    }
  },
  methods: {
    ...mapActions([
      'logout',
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
     * @param {{id: number, name: number, type_name: 'air'|'depot'}} param0 node info
     * @param {{id: number, status: number}} param1 node status
     * @returns {{id: number, icon: string, color: string, text: string}}
     */
    statusToObject({ id, name, type_name }, { status }) {
      const icon = StatusIcon[status] || StatusIcon.default;
      const color = StatusColor[status] || StatusColor.default;
      const text = `${this.getTypeText(type_name)} ${name} ${this.getStatusText(status)}`;
      return { id, icon, color, text };
    },
    /**
     * @param {'logout'} cmd
     */
    handleCommand(cmd) {
      switch (cmd) {
        case 'logout':
          this.logout();
          this.$router.replace({ name: 'login' });
          break;
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