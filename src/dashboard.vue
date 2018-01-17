<template>
  <div>

    <el-container>
      <el-header style="height: 60px;margin: 0;padding: 0;">
        <el-menu
          :default-active="activeIndex2"
          class="el-menu"
          mode="horizontal"
          @select="handleSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">
          <el-menu-item index="1">处理中心</el-menu-item>
          <el-submenu index="2">
            <template slot="title">我的工作台</template>
            <el-menu-item index="2-1">选项1</el-menu-item>
            <el-menu-item index="2-2">选项2</el-menu-item>
            <el-menu-item index="2-3">选项3</el-menu-item>
          </el-submenu>
          <el-menu-item index="3"><a href="https://www.sb.im" target="_blank">官方网站</a></el-menu-item>
        </el-menu>
      </el-header>
      <el-container>
        <el-aside width="220px">
          <sidemenu @select="getItems"></sidemenu>
        </el-aside>
        <el-container>
          <el-main>
            <tab-page :node="this.$store.state.items[1]"></tab-page>
            <img src="http://192.168.101.208:8080/?action=stream" />
            <el-button @click="" type="primary">获取Items信息</el-button>

            Main
          </el-main>
          <el-footer>Footer</el-footer>
        </el-container>
      </el-container>
    </el-container>
    <router-link to="/login">Go to Foo</router-link>
    <router-link to="/app">Go to Bar</router-link>
    <router-view></router-view>

    <img src="./assets/logo.png">

  </div>
</template>

<script>
import SideMenu from './page/sidemenu.vue'
import Tabs from './page/tabs.vue'
//Vue.component('monitor-img', monitorimg)

  export default {
    data() {
      return {
        config: {},
        items: [],
        activeIndex: '1',
        activeIndex2: '1'
      };
    },
    components: {
      'tab-page': Tabs,
      'sidemenu': SideMenu
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      getItems () {
        console.log("GGGGG")
      }
    }
  }
</script>

<style scoped>

  .el-menu {
    margin: 0;
    padding: 0;
  }

  .el-header {
    margin: 0;
    padding: 0;
  }

  .el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    background-color: #545c64;
    color: #333;
    line-height: 200px;
  }

  .el-main-old {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }

  body > .el-container {
    margin-bottom: 40px;
  }

</style>
