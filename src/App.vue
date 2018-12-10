<template>
  <main id="app">
    <router-view :nodes="nodes" :plans="plans"></router-view>
  </main>
</template>

<script>
  export default {
    data(){
      return {
        nodes: [],
        plans: [],
        defaultPage: 'depot',// 刷新之后默认显示'plans'/'depot'/'air'
      }
    },
    created() {
      this.getConfig()
      this.$store.commit("token", JSON.parse(localStorage.getItem('login')))
    },
    methods: {
      getConfig() {
        let configURL = location.protocol + "//" + location.host + "/config.json";
        this.$http.get(configURL)
          .then(res => {
            this.$i18n.locale = res.data.lang ? res.data.lang : this.$store.state.config.lang;
            this.$store.commit("config", {
              config: res.data,
              callback: () => {
                this.getNodes();
                this.getPlans();
              }
            });
          })
          .catch(err => {
            this.$store.commit("config", {
              config:this.$store.state.config,
              callback: () => {
                this.getNodes();
                this.getPlans();
              }
            });
            console.log(err);
          });
      },
      // 获取nodes
      getNodes() {
        let nodesAPI = this.$store.state.api.nodes;
        this.$http.get(nodesAPI)
          .then(res => {
            if(res.status===200) {
              console.log(res.data)
              this.nodes = res.data;
              this.defaultShow();
              this.$store.commit('itemAdd',{
                data: res.data,
                type: 'nodes'
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      },
      // 获取plans
      getPlans() {
        let plansAPI = this.$store.state.api.plans;
        this.$http.get(plansAPI)
          .then(res => {
            if(res.status===200) {
              this.plans = res.data;
              this.defaultShow();
              this.$store.commit('itemAdd',{
                data: res.data,
                type: 'plans'
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      },
      // 刷新之后默认显示的页面
      defaultShow() {
        for(let item of (this.defaultPage!=='plans'?this.nodes:this.plans)) {
          if (this.defaultPage === item.type_name) {
            this.tabsAdd(this.defaultPage,item);
            return true;
          } else if (!item.type_name) {
            this.tabsAdd(this.defaultPage,item);
            return true;
          }
        }
      },
      /**
       * 添加并激活对应Tabs
       * @param key   页面类型
       * @param item  对应数据
       */
      tabsAdd(key,item) {
        // 先判断类型，若不存在对应类型则直接添加，若存在则继续判断是否有相同id存在，不存在则添加
        this.$store.state.links.findIndex(val => val.type === key) === -1 ?
          this.$store.commit('linkAdd', {item, type: key}) :
          (this.$store.state.links.findIndex(val => {
            return val.type === key && (+val.item.id) === (+item.id);
          }) === -1 && this.$store.commit('linkAdd', {item, type: key}));
      }
    }
  }
</script>

<style>
  #app {
    height: 100%;
    overflow: hidden;
  }


</style>
