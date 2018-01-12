<template>
  <div id="app">
    <router-link to="/login">Go to Foo</router-link>
    <router-link to="/app">Go to Bar</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    methods: {
      getConfig() {
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
