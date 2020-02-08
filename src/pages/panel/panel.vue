<template>
  <div class="sd-panel">
    <sd-aside class="sd-panel__side"></sd-aside>
    <div class="sd-panel__main">
      <sd-header></sd-header>
      <div class="sd-panel__view">
        <router-view></router-view>
      </div>
      <div class="sd-panel__footer">
        <span>SDWC v{{version}}</span>
        <span class="sd-panel__cpy">Copyright © 2017-2019 StrawBerry Tech.</span>
      </div>
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
  computed: {
    version() {
      return __SDWC__VERSION__; // would be replaced on compile
    }
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
.sd-panel__footer {
  margin-top: auto;
  height: 60px;
  color: #333;
  background-color: #b3c0d1;
  line-height: 60px;
  font-size: 14px;
  padding: 0 10px;
}
.sd-panel__cpy {
  float: right;
}
</style>
