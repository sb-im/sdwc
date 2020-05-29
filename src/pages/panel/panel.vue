<template>
  <div class="sd-panel">
    <sd-aside class="sd-panel__side"></sd-aside>
    <div class="sd-panel__main">
      <sd-header></sd-header>
      <router-view class="sd-panel__view"></router-view>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import Aside from './aside.vue';
import Header from './header.vue';

export default {
  name: 'sd-panel',
  methods: {
    ...mapActions([
      'getUserInfo',
      'getNodes',
      'subscribeNodes',
      'getPlans'
    ])
  },
  inject: ['configurePromise'],
  created() {
    // ensure action `configure` completed
    this.configurePromise
      .then(() => this.getUserInfo())
      .then(() => {
        this.getNodes().then(() => this.subscribeNodes());
        this.getPlans();
      });
  },
  components: {
    [Aside.name]: Aside,
    [Header.name]: Header
  }
};
</script>

<style>
.sd-panel {
  height: 100vh;
  display: flex;
}
.sd-panel__side {
  height: 100%;
  flex-shrink: 0;
}
.sd-panel__main {
  height: 100%;
  overflow: hidden auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.sd--safari .sd-panel__main {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.sd-panel__view {
  padding: 10px;
  flex-grow: 1;
}
.sd-panel__view.el-loading-parent--relative {
  height: 100%;
}
.sd--safari .sd-panel__view.el-loading-parent--relative {
  height: calc(100vh - 120px);
}
</style>
