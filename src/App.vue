<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    created: function () {
      this.getConfig()
    },
    methods: {
      getConfig() {
        let url = "http://" + location.host + "/config.json"
        console.log(url)
        this.$http.get(url)
        .then((response) => {
          console.log(this)
          //console.log(response.data)
          //this.$store.state.config.server = response.data.server
          this.$store.commit("config", response.data)
          //this.$store.state.config = response.data
          //this.$router.push('app')
        })
        .catch((error) => {
          //console.log(error)
        })
      }
    }
  }

</script>


<style>
  body{
    margin: 0;
    padding: 0;
  }

</style>
