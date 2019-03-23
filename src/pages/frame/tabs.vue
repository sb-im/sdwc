<template>
  <el-tabs
    class="tabs"
    @tab-remove="tabRemove"
    closable
    @tab-click="tabsClick"
    v-model="$store.state.active"
    type="card">
    <el-tab-pane
      v-for="(val,index) in $store.state.links"
      :key="index"
      :label="val.item.name"
      class="tab-item"
      :name="val.type+val.item.id">
      <sd-plan v-if="val.type==='plans'" v-cloak></sd-plan>
      <sd-depot v-else-if="val.type==='depot'" :node="val.item" v-cloak></sd-depot>
      <sd-air v-else-if="val.type==='air'" :node="val.item" v-cloak></sd-air>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import Plans from '../contents/plans/index'
  import Depot from '../contents/depot'
  import Air from '../contents/air'

  export default {
    data() {
      return {

      }
    },
    created(){

    },
    components: {
      'sd-plan': Plans,
      'sd-depot': Depot,
      'sd-air': Air
    },
    methods: {
      tabsClick(component) {
        let tmp = {type: component.name.replace(/[^a-zA-z]+/ig,''), id: component.name.replace(/[^0-9]/ig,'')};
        if (tmp.type === 'plans') {
          this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          this.$store.dispatch('getPlanInfo', {_this:this,id:tmp.id});
        } else {
          if (tmp.type === 'air') {
            this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          } else {
            this.$store.dispatch('getWeather', this);
          }
        }
      },
      tabRemove(index) {
        let tmp = {type: index.replace(/[^a-zA-z]+/ig, ''), id: index.replace(/[^0-9]/ig, '')};
        this.$store.commit('tabChange',this.tabActive(index,this.$store.state.active,this.$store.state.links));
        this.$store.commit("linkDel", tmp);
      },
      tabActive(del,cur,links){
        if (del === cur) {
          del = {type: del.replace(/[^a-zA-z]+/ig, ''), id: del.replace(/[^0-9]/ig, '')};
          links.forEach((tab, index) => {
            if(tab.type === del.type && tab.item.id === (+del.id) ){
              let next = links[index + 1] || links [index - 1];
              cur = next ? next.type+next.item.id : cur;
              return true;
            }
          });
        }
        let tmp = {type: cur.replace(/[^a-zA-z]+/ig, ''), id: cur.replace(/[^0-9]/ig, '')};
        if (tmp.type === 'plans') {
          this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          this.$store.dispatch('getPlanInfo', {_this:this,id:tmp.id});
        } else {
          if (tmp.type === 'air') {
            this.$store.state.weaTimer && clearInterval(this.$store.state.weaTimer);
          } else {
            this.$store.dispatch('getWeather', this);
          }
        }
        return cur;
      }
    }
  }
</script>

<style>
  .tabs { height: 100%; }
  .tabs .el-tabs__header { margin: 0; }
  .tabs .el-tabs__content { height: calc(100% - 41px); }
  .tabs .tab-item {
    padding: 5px;
    height: 100%;
    overflow-y: auto;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .tabs .wrapper {
    width: 100%;
    min-height: 100%;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #e4eaef;
  }
</style>
