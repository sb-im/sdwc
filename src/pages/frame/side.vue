<template>
  <el-aside class="aside" width="160px">
    <el-menu
      :default-active="activeIndex"
      class="menu"
      @select="menuSelect"
      @open="menuOpen"
      @close="menuClose"
      background-color="#545c64"
      text-color="#ccc">
      <el-menu-item index="task" class="font-18">
        <img src="../../assets/images/aside/task.svg"/>任务管理
      </el-menu-item>
      <el-menu-item index="airport" class="font-18">
        <img src="../../assets/images/aside/airport.svg"/>机场
      </el-menu-item>
      <el-menu-item index="drone" class="font-18">
        <img src="../../assets/images/aside/drone.svg"/>无人机
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
  export default {
    data() {
      return {
        activeIndex: 'task'
      }
    },
    created(){
      this.activeIndex = this.$store.state.aside?this.$store.state.aside:'task';
      this.$store.commit('asideLink',this.activeIndex)
    },
    methods: {
      menuSelect(key,keyPath){
        this.$store.commit('asideLink',key);
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

<style scoped>
  /*侧边菜单*/
  .aside {
    padding-top: 100px;
    width: 100%;
    min-height: 100%;
    background-color: #545c64;
  }
  .aside .menu {border-right: 0;}
  .aside .menu img {
    width: 30px;
    height: 30px;
    padding-right: 10px;
  }
  .aside .menu .el-menu-item {
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
  .aside .menu .is-active {
    position: relative;
    color: #fff;
    border-color: #fff5;
    box-shadow: inset 4px 0 0 0 #28b3e4;
  }
  .aside .menu .is-active:after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
    border-style: solid;
    border-color: transparent #fff transparent transparent;
    border-width: 10px 12px 10px 0;
  }
</style>
