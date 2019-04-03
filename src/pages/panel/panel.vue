<template>
  <el-container class="panel">
    <sd-aside></sd-aside>
    <el-container direction="vertical">
      <sd-header></sd-header>
      <el-main>Main</el-main>
      <sd-footer></sd-footer>
    </el-container>
  </el-container>
</template>

<script>
import { mapActions } from 'vuex';
import { config } from '@/api/sdwc';

import Aside from './aside.vue';
import Header from './header.vue';
import Footer from './footer.vue';

export default {
  methods: {
    ...mapActions([
      'getUserInfo',
      'getNodes',
      'getPlans'
    ])
  },
  created() {
    // ensure config was loaded
    config().then(() => {
      this.getUserInfo();
      this.getNodes();
      this.getPlans();
    });
  },
  components: {
    'sd-aside': Aside,
    'sd-header': Header,
    'sd-footer': Footer
  }
};
</script>
