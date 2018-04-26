<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    created() {
      this.getConfig()
    },
    methods: {
      getConfig() {
        let url = location.protocol + "//" + location.host + "/config.json"
        console.log(url)
        this.$http.get(url)
        .then((response) => {
          this.$store.commit("config", response.data)
        })
        .catch((error) => {
          console.log(error)
          this.$store.commit("config", this.$store.state.config)
        })
      }
    }
  }
</script>

<style>
  body {
    margin: 0;
    padding: 0;
  }
</style>
