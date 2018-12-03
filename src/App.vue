<template>
  <main id="app">
    <router-view></router-view>
  </main>
</template>

<script>
  export default {
    created() {
      this.getConfig()
      this.$store.commit("token", JSON.parse(localStorage.getItem('login')))
    },
    methods: {
      getConfig() {
        let url = location.protocol + "//" + location.host + "/config.json"
        console.log(url)
        this.$http.get(url)
        .then((response) => {
          this.$i18n.locale = response.data.lang ? response.data.lang : this.$store.state.config.lang
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
  #app {
    height: 100%;
    overflow: hidden;
  }
</style>
