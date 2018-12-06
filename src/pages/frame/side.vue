<template>
  <el-aside class="aside" width="160px">
    <el-menu
      :default-active="$store.state.active"
      class="menu"
      @select="menuSelect"
      @open="menuOpen"
      background-color="#545c64"
      text-color="#ccc">
      <el-menu-item index="task" class="menu-item">
        <img src="../../assets/images/aside/task.svg"/><span class="font-18">任务管理</span>
      </el-menu-item>
      <el-submenu index="air">
        <template slot="title">
          <img src="../../assets/images/aside/airport.svg"/><span class="font-18">机场</span>
        </template>
        <el-menu-item
          class="menu-item"
          v-for="(val,index) in nodes"
          :key="index"
          v-if="val.type_name==='air'"
          :index="val.id+''">
          {{ val.name }}
        </el-menu-item>
      </el-submenu>
      <el-submenu index="depot">
        <template slot="title">
          <img src="../../assets/images/aside/drone.svg"/><span class="font-18">无人机</span>
        </template>
        <el-menu-item
          class="menu-item"
          v-for="(val,index) in nodes"
          :key="index"
          v-if="val.type_name==='depot'"
          :index="val.id+''">
          {{ val.name }}
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
  export default {
    data() {
      return {

      }
    },
    props: {
      nodes: {
        type: Array,
        required: true,
        default: () => {
          return [];
        }
      }
    },
    mounted(){

    },
    methods: {
      menuSelect(key) {
        if(key!=='task'){
          for(let item of this.nodes) {
            key === (item.id+'') && this.$store.commit('linkAdd',item);
          }
        }else this.$store.commit('tabChange',key);
      },
      menuOpen(key) {
        switch (key) {
          case 'air':this.openFirst('air');break;
          case 'depot':this.openFirst('depot');break;
        }
      },
      /**
       * 菜单打开时(此项菜单下无子项打开)，默认打开此项菜单下的第一个子项
       * @param type   类型(air/depot)，须与nodes.json里面的type_name匹配
       */
      openFirst(type) {
        for (let item of this.nodes) {
          if (item.type_name===type) {
            this.$store.state.links.findIndex(val => {
              return (+val.id) === (+item.id);
            }) === -1 && this.$store.commit('linkAdd',item);
            return true;
          }
        }
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
  .aside .menu .menu-item {
    min-width: 0;
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }
  .aside .menu .menu-item.is-active {
    position: relative;
    color: #fff;
    border-color: #fff5;
    box-shadow: inset 4px 0 0 0 #28b3e4;
  }
  .aside .menu .menu-item.is-active:after {
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
