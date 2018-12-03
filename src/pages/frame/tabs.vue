<template>
  <el-tabs class="tabs" v-model="activeIndex" type="card" closable @tab-click="handleClick">
    <el-tab-pane class="tab-item" label="用户管理" name="first">
      <sd-task v-if="this.$store.state.aside==='task'" v-cloak></sd-task>
      <sd-airport v-if="this.$store.state.aside==='airport'" v-cloak></sd-airport>
      <sd-drone v-if="this.$store.state.aside==='drone'" v-cloak></sd-drone>
    </el-tab-pane>
    <el-tab-pane class="tab-item" label="配置管理" name="second">
      <sd-task v-if="this.$store.state.aside==='task'" v-cloak></sd-task>
      <sd-airport v-if="this.$store.state.aside==='airport'" v-cloak></sd-airport>
      <sd-drone v-if="this.$store.state.aside==='drone'" v-cloak></sd-drone>
    </el-tab-pane>
    <el-tab-pane class="tab-item" label="角色管理" name="third">
      <sd-task v-if="this.$store.state.aside==='task'" v-cloak></sd-task>
      <sd-airport v-if="this.$store.state.aside==='airport'" v-cloak></sd-airport>
      <sd-drone v-if="this.$store.state.aside==='drone'" v-cloak></sd-drone>
    </el-tab-pane>
    <el-tab-pane class="tab-item" label="定时任务补偿" name="fourth">
      <sd-task v-if="this.$store.state.aside==='task'" v-cloak></sd-task>
      <sd-airport v-if="this.$store.state.aside==='airport'" v-cloak></sd-airport>
      <sd-drone v-if="this.$store.state.aside==='drone'" v-cloak></sd-drone>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import Task from './task'
  import Airport from './airport'
  import Drone from './drone'
  export default {
    data() {
      return {
        activeIndex: 'first'
      }
    },
    created(){

    },
    components: {
      'sd-task':Task,
      'sd-airport':Airport,
      'sd-drone':Drone
    },
    methods: {
      handleClick(key,keyPath){
        console.log(key, keyPath);
      },
      menuOpen(key,keyPath){
        console.log(key,keyPath);
      },
      menuClose(key,keyPath){
        console.log(key,keyPath);
      }
    }
  }
</script>

<style>
  .tabs {height: 100%;}
  .tabs .el-tabs__header {margin: 0;}
  .tabs .el-tabs__content {
    height: calc(100% - 41px);
  }
  .tabs .tab-item {
    padding: 5px;
    height: 100%;
    overflow: hidden;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .tabs .wrapper {
    height: 100%;
    overflow-y: auto;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #e4eaef;
  }
</style>
