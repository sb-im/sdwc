<template>
  <el-header class="header pos-f">
    <img class="logo pos-a" src="../assets/images/header/logo.png"/>
    <h1 class="title font-20">Superdock无人机自动机场</h1>
    <el-menu
      class="menu pos-a font-14"
      mode="horizontal"
      @select="navSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item index="1">
        <img src="../assets/images/header/h_drone.svg"/>无人机通讯正常
      </el-menu-item>
      <el-menu-item index="2">
        <img src="../assets/images/header/h_airport.svg"/>机场通讯正常
      </el-menu-item>
      <el-submenu index="3">
        <template slot="title">
          <img src="../assets/images/header/user.svg"/>调试人员
        </template>
        <el-menu-item index="loginout">退出</el-menu-item>
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
      navSelect(key, keyPath) {
        if(key==='loginout') {
          this.$router.push({ path: '/' });
        }
      },
      navOpne(key, keyPath) {
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
    top: 60%;
    left: 65px;
    width: 40px;
    height: 40px;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
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
