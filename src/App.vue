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
      localStorage.getItem('login') ? this.$store.commit('token', JSON.parse(localStorage.getItem('login'))) : null ;
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
