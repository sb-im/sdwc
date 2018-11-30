<template>
  <el-container class="main">
    <sd-header></sd-header>
    <sd-aside></sd-aside>
    <el-container>
      <el-main class="frame">
        <sd-task v-if="this.$store.state.aside==='task'" v-cloak></sd-task>
        <sd-airport v-if="this.$store.state.aside==='airport'" v-cloak></sd-airport>
        <sd-drone v-if="this.$store.state.aside==='drone'" v-cloak></sd-drone>
      </el-main>
      <el-footer class="footer pos-f text-c">
        Copyright © 2017-2018 StrawBerry Tech.
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
  import Header from './header'
  import Aside from './side'
  import Task from './frame/task/index'
  import Airport from './frame/airport/index'
  import Drone from './frame/drone/index'

  export default {
    data() {
      return {

      }
    },
    created(){

    },
    components: {
      'sd-header':Header,
      'sd-aside':Aside,
      'sd-task':Task,
      'sd-airport':Airport,
      'sd-drone':Drone
    },
    methods: {

    }
  }
</script>

<style scoped>
  /*外部容器*/
  .main {
    width: 100%;
    height: 100%;
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
