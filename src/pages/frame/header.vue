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
          <img src="../../assets/images/header/h_drone.svg"/>通讯状态
        </template>
        <el-menu-item v-for="(node, index) in $store.state.nodes" :key="node.id" :index="`1-${index + 1}`">
          {{ node.name }}
          <template v-if="node.type_name === 'air'">{{ $t('header.air',{status:$t('header.normal')}) }}</template>
          <template v-else-if="node.type_name === 'depot'">{{ $t('header.depot',{status:$t('header.normal')}) }}</template>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">
          <img src="../../assets/images/header/user.svg"/>调试人员
        </template>
        <el-menu-item index="loginout">{{ $t('header.logout') }}</el-menu-item>
      </el-submenu>
    </el-menu>
  </el-header>
</template>

<script>
  export default {
    data() {
      return {
        activeIndex: '1'
      }
    },
    methods: {
      navSelect(key) {
        if(key==='loginout') {
          this.$router.push({ path: '/' });
        }
      },
      navOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      navClose(key, keyPath) {
        console.log(key, keyPath);
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
