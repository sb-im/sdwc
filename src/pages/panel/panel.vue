<template>
  <div class="sd-panel">
    <div class="sd-panel__side">
      <sd-aside></sd-aside>
    </div>
    <div class="sd-panel__main">
      <sd-header></sd-header>
      <div class="sd-panel__view">
        <router-view></router-view>
      </div>
      <div class="sd-panel__footer">Copyright © 2017-2019 StrawBerry Tech.</div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { config } from '@/api/sdwc';

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
  created() {
    // ensure config was loaded
    config()
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
  width: 200px;
}
.sd-panel__main {
  height: 100%;
  overflow: hidden auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.sd-panel__view {
  padding: 10px;
  flex-grow: 1;
}
.sd-panel__footer {
  margin-top: auto;
  padding-right: 10px;
  height: 60px;
  color: #333;
  background-color: #b3c0d1;
  line-height: 60px;
  text-align: right;
  font-size: 14px;
}
</style>
