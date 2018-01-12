<template>
  <div id="app">
    <el-button type="primary" @click="getConfig">提交</el-button>

    <router-link to="/login">Go to Foo</router-link>
    <router-link to="/app">Go to Bar</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
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
          console.log(error)
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
