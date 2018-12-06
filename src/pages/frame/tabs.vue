<template>
  <el-tabs
    class="tabs"
    v-model="$store.state.active"
    type="card"
    @tab-remove="tabRemove"
    @tab-click="tabsClick">
    <el-tab-pane class="tab-item" label="任务管理" name="task">
      <sd-task></sd-task>
    </el-tab-pane>
    <el-tab-pane
      v-for="(val,index) in $store.state.links"
      :key="index"
      :label="val.name"
      class="tab-item"
      closable
      :name="val.id+''">
      <sd-air v-if="val.type_name==='air'" v-cloak></sd-air>
      <sd-drone v-if="val.type_name==='depot'" v-cloak></sd-drone>
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

      }
    },
    props:{
      /*nodes:{
        type:Array
      }*/
    },
    created(){

    },
    components: {
      'sd-task': Task,
      'sd-air': Airport,
      'sd-drone': Drone
    },
    methods: {
      tabsClick(key,keyPath) {
        console.log(key,keyPath);
      },
      tabRemove(id) {
        this.$store.commit('tabChange',this.tabActive(id,this.$store.state.active,this.$store.state.links));
        this.$store.commit("linkDel", +id);
      },
      tabActive(del,cur,links){
        if(links.length !== 1) {
          if(cur === del) {
            links.forEach((tab, index) => {
              if(tab.id === (+del)){
                let next = links[index+1] || links[index-1];
                cur = next ? next.id : cur;
                return true;
              }
            });
          }
        }else cur = 'task';
        return cur;
      }
    }
  }
</script>

<style>
  .tabs {height: 100%;}
  .tabs .el-tabs__header {margin: 0;}
  .tabs .el-tabs__content {height: calc(100% - 41px);}
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
