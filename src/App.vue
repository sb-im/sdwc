<template>
  <main id="app">
    <router-view></router-view>
  </main>
</template>

<script>
  export default {
    data(){
      return {

      }
    },
    created() {
      this.$store.dispatch('appInit',this);
    },
    methods: {

    }
  }
</script>

<style>
  #app {
    height: 100%;
    overflow: hidden;
  }


</style>
