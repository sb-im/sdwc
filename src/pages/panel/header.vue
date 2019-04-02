<template>
  <el-header class="header">
    <span class="header-title">{{ $t('header.title') }}</span>
    <el-menu
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-submenu index="status">
        <template slot="title">
          <sd-icon value="header/h_drone"/>
          {{ $t('header.status') }}
        </template>
        <el-menu-item
          v-for="st in status"
          :key="st.id"
          :index="`status-${st.id}`"
        >
          <i :class="st.icon" :style="{color: st.color}"></i>
          {{ st.text }}
        </el-menu-item>
      </el-submenu>
      <el-submenu index="user">
        <template slot="title">
          <sd-icon value="header/user"/>
          {{ $store.state.user.email }}
        </template>
        <el-menu-item index="loginout">{{ $t('header.logout') }}</el-menu-item>
      </el-submenu>
    </el-menu>
  </el-header>
</template>

<script>
import { mapState } from 'vuex';
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
</style>
