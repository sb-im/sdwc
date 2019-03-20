<template>
  <el-container class="main">
    <sd-header></sd-header>
    <sd-aside></sd-aside>
    <el-container>
      <el-main class="frame">
        <sd-tabs></sd-tabs>
      </el-main>
      <el-footer class="footer pos-a text-c">
        Copyright © 2017-2018 StrawBerry Tech.
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
  import store from '../config/store';
  import Header from './frame/header'
  import Aside from './frame/side'
  import Tabs from './frame/tabs'

  export default {
    beforeRouteEnter(to, from, next) {
      if (store.state.token === '') {
        next('/login');
      } else {
        next();
      }
    },
    data() {
      return {

      }
    },
    created(){

    },
    components: {
      'sd-header':Header,
      'sd-aside':Aside,
      'sd-tabs':Tabs
    },
    methods: {

    }
  }
</script>

<style scoped>
  /*外部容器*/
  .main {
    position: relative;
    width: 1280px;
    height: 100%;
    margin: auto;
    overflow: hidden;
  }
  /*框架内容区*/
  .frame {
    padding: 0;
    margin: 60px 0;
    height: 100%;
    overflow: auto;
  }
  /*底部*/
  .footer {
    top: auto;
    left: 160px;
    right: 0;
    bottom: 0;
    color: #333;
    line-height: 60px;
    background-color: #b3c0d1;
  }
</style>
