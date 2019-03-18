<template>
  <main id="app">
    <router-view></router-view>
  </main>
</template>

<script>
  import mqttClient from './config/mqtt';
  export default {
    data(){
      return {

      }
    },
    created() {
      this.$store.dispatch('appInit',this)
        .then(() => {
          mqttClient.connect(this.$store.state.config.mqtt_url);
        });
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
