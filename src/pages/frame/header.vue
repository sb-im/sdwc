<template>
  <el-header class="header pos-a">
    <img class="logo pos-a" src="../../assets/images/header/logo.png"/>
    <h1 class="title font-20">{{ $t('header.title') }}</h1>
    <el-menu
      class="menu pos-a font-14"
      mode="horizontal"
      @select="navSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-submenu index="1">
        <template slot="title">
          <img src="../../assets/images/header/h_drone.svg"/>{{ $t('header.status') }}
        </template>
        <el-menu-item v-for="(st, index) in nodeStatus" :key="`1-${index}`" :index="`1-${index}`">
          <i :class="st.icon" :style="{color: st.color}"></i>
          {{ st.text }}
        </el-menu-item>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">
          <img src="../../assets/images/header/user.svg"/>
          {{ $store.state.userInfo.email }}
        </template>
        <el-menu-item index="loginout">{{ $t('header.logout') }}</el-menu-item>
      </el-submenu>
    </el-menu>
  </el-header>
</template>

<script>
const StatusIcon = {
  0: 'el-icon-success',
  1: 'el-icon-info',
  2: 'el-icon-error'
};

const StatusColor= {
  0: '#67C23A',
  1: '#909399',
  2: '#F56C6C'
};

  export default {
    computed: {
      nodeStatus() {
        return this.$store.state.nodeStatus.map(st => {
          const node = this.$store.state.nodes.find(node => st.id == node.id);
          return {
            icon: StatusIcon[st.status] || 'el-icon-warning',
            color: StatusColor[st.status] || '#E6A23C',
            text: `${this.getTypeText(node.type_name)} ${node.name} ${this.getStatusText(st.status)}`
          };
        })
      }
    },
    methods: {
      getTypeText(type){
        switch (type) {
          case 'air': return this.$t('header.air');
          case 'depot': return this.$t('header.depot');
        }
      },
      getStatusText(status) {
        switch (status) {
          case 0: return this.$t('header.normal');
          case 1: return this.$t('header.shutdown');
          case 2: return this.$t('header.net_error');
          default: return this.$t('header.never_online');
        }
      },
      navSelect(key) {
        if(key==='loginout') {
          this.$router.push({ path: '/' });
        }
      }
    }
  }
</script>

<style scoped>
  .header {
    top: 0;
    left: 0;
    right: 0;
    bottom: auto;
    line-height: 60px;
    background-color: #545c64;
  }
  .header .logo {
    top: 40%;
    left: 65px;
    width: 50px;
    height: 50px;
  }
  .header .title {
    color: #fff;
    padding-left: 180px;
    font-weight: normal;
  }
  .header .menu {
    top: 0;
    left: auto;
    right: 0;
    bottom: 0;
    font-size: 14px;
    white-space: nowrap;
  }
  .header .menu img {
    width: 35px;
    height: 35px;
    padding: 0 5px;
  }
</style>
