<template>
  <div>

    <el-container>
      <el-header style="height: 60px;margin: 0;padding: 0;">
        <sd-header></sd-header>
      </el-header>
      <el-container>
        <el-aside width="220px">
          <sidemenu @select="getItems"></sidemenu>
        </el-aside>
        <el-container>
          <el-main>
            <tab-page :node="this.$store.state.items[1]"></tab-page>
            <el-button @click="" type="primary">获取Items信息</el-button>

            Main
          </el-main>
          <el-footer>Footer</el-footer>
        </el-container>
      </el-container>
    </el-container>
    <router-view></router-view>

    <img src="./assets/logo.png">

  </div>
</template>

<script>
import SideMenu from './page/sidemenu.vue'
import Header from './page/header.vue'
import Tabs from './page/tabs.vue'
//Vue.component('monitor-img', monitorimg)

  export default {
    data() {
      return {
        config: {}
      }
    },
    components: {
      'tab-page': Tabs,
      'sd-header': Header,
      'sidemenu': SideMenu
    },
    methods: {
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
