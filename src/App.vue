<template>
  <router-view></router-view>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions([
      'configure'
    ])
  },
  created() {
    this.configure();
  }
};
</script>
