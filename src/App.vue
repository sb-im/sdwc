<template>
  <main id="app">
    <router-view :nodes="nodes"></router-view>
  </main>
</template>

<script>
  export default {
    data(){
      return {
        nodes: []
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
          .then((res) => {
            this.$i18n.locale = res.data.lang ? res.data.lang : this.$store.state.config.lang;
            this.$store.commit("config", {
              config: res.data,
              callback: this.getItems
            });
          })
          .catch((err) => {
            console.log(err);
            this.$store.commit("config", {
              config:this.$store.state.config,
              callback: this.getItems
            });
          });
      },
      getItems(){
        let nodesAPI = this.$store.state.api.nodes;
        this.$http.get(nodesAPI)
          .then((res) => {
            if(res.status===200) {
              this.nodes = res.data;
              this.$store.commit('items',res.data)
            }
          })
          .catch((err) => {
            console.log(err);
          });
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
