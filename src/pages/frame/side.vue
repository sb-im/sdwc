<template>
  <el-aside class="aside" width="160px">
    <el-menu
      :default-active="$store.state.active"
      class="menu"
      @select="menuSelect"
      @open="menuOpen"
      background-color="#545c64"
      text-color="#ccc">
      <el-submenu index="plans">
        <template slot="title">
          <img src="../../assets/images/aside/task.svg"/><span class="font-16">{{ $t('sidemenu.plan') }}</span>
        </template>
        <el-menu-item
          class="menu-item"
          v-for="(val,index) in $store.state.plans"
          :key="index"
          :index="'plans'+val.id">
          {{ val.name }}
        </el-menu-item>
      </el-submenu>
      <el-submenu index="depot">
        <template slot="title">
          <img src="../../assets/images/aside/airport.svg"/><span class="font-16">{{ $t('sidemenu.depot') }}</span>
        </template>
        <el-menu-item
          class="menu-item"
          v-for="(val,index) in depotNodes"
          :key="index"
          :index="'depot'+val.id">
          {{ val.name }}
        </el-menu-item>
      </el-submenu>
      <el-submenu index="air">
        <template slot="title">
          <img src="../../assets/images/aside/drone.svg"/><span class="font-16">{{ $t('sidemenu.air') }}</span>
        </template>
        <el-menu-item
          class="menu-item"
          v-for="(val,index) in airNodes"
          :key="index"
          :index="'air'+val.id">
          {{ val.name }}
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
  import {mapGetters} from 'vuex';
  export default {
    data() {
      return {

      }
    },
    created() {

    },
    computed: {
      ...mapGetters([
        'depotNodes',
        'airNodes'
      ])
    },
    methods: {
      menuSelect(key,keyPath) {
        let id = key.replace(/[^0-9]/ig,'');
        for(let item of (keyPath[0]!=='plans'?this.$store.state.nodes:this.$store.state.plans)) {
          id === (item.id+'') && this.$store.commit('linkAdd',{item, type: keyPath[0]});
        }
        if (keyPath[0] === 'plans') {
          this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          this.$store.dispatch('getPlanInfo', {_this:this,id});
        } else {
          if (keyPath[0] === 'air') {
            this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          } else {
            this.$store.dispatch('getWeather', this);
          }
        }
      },
      // 打开菜单时(此菜单无子项打开时)，默认显示第一项子项
      menuOpen(key) {
        for(let item of (key!=='plans'?this.$store.state.nodes:this.$store.state.plans)) {
          if (key === item.type_name) {
            this.tabsAdd(key,item);
            if (key === 'air') {
              this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
            } else if (key === 'depot') {
              this.$store.dispatch('getWeather', this);
            }
            return true;
          } else if (!item.type_name){
            this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
            this.tabsAdd(key,item,()=>{
              this.$store.dispatch('getPlanInfo', {_this:this,id:item.id});
            });
            return true;
          }
        }
      },
      /**
       * 添加并激活对应Tabs
       * @param key   页面类型
       * @param item  对应数据
       * @param callback  回调
       */
      tabsAdd(key,item,callback) {
        // 先判断类型，若不存在对应类型则直接添加，若存在则继续判断是否有相同id存在，不存在则添加
        this.$store.state.links.findIndex(val => val.type === key) === -1 ?
          this.$store.commit('linkAdd', {item, type: key}) :
            (this.$store.state.links.findIndex(val => {
              return val.type === key && (+val.item.id) === (+item.id);
            }) === -1 && this.$store.commit('linkAdd', {item, type: key}));
        callback && callback();
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
    width: 25px;
    height: 25px;
    padding-right: 8px;
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
