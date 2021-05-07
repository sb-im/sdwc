<template>
  <el-menu
    class="aside__menu"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#fff"
    :default-active="activeIndex"
    :collapse="collapse"
    router
  >
    <div class="aside__header">
      <img v-if="config.aside_logo" class="aside__logo" :src="config.aside_logo" />
    </div>
    <el-menu-item index="overview" :route="{ name: 'overview' }">
      <sd-icon value="info-circle"></sd-icon>
      <span slot="title" v-t="'common.overview'"></span>
    </el-menu-item>
    <el-submenu index="plan">
      <template #title>
        <sd-icon value="tasks-blue"></sd-icon>
        <span v-t="'common.plan'"></span>
      </template>
      <li v-if="collapse" class="aside__subtitle" v-t="'common.plan'"></li>
      <el-menu-item :index="`plan-new`" :route="{ name: 'plan/new' }">
        <i class="el-icon-plus"></i>
        <span v-t="'plan.edit.add'"></span>
      </el-menu-item>
      <el-menu-item
        v-for="plan in plans"
        :key="plan.id"
        :index="`plan-${plan.id}`"
        :route="{ name: 'plan', params: { id: plan.id } }"
        :class="{ 'is-running': isPlanRunning[plan.id] }"
      >{{ plan.name }}</el-menu-item>
    </el-submenu>
    <el-submenu index="drone">
      <template #title>
        <sd-icon value="drone-blue"></sd-icon>
        <span slot="title" v-t="'common.air'"></span>
      </template>
      <li v-if="collapse" class="aside__subtitle" v-t="'common.air'"></li>
      <el-menu-item
        v-for="drone in drones"
        :key="drone.info.id"
        :index="`node-${drone.info.id}`"
        :route="{ name: 'node', params: { id: drone.info.id } }"
      >{{ drone.info.name }}</el-menu-item>
    </el-submenu>
    <el-submenu index="depot">
      <template #title>
        <sd-icon value="depot-blue"></sd-icon>
        <span slot="title" v-t="'common.depot'"></span>
      </template>
      <li v-if="collapse" class="aside__subtitle" v-t="'common.depot'"></li>
      <el-menu-item
        v-for="depot in depots"
        :key="depot.info.id"
        :index="`node-${depot.info.id}`"
        :route="{ name: 'node', params: { id: depot.info.id } }"
      >{{ depot.info.name }}</el-menu-item>
    </el-submenu>
    <div class="aside__version">
      <span v-if="!collapse" class="aside__version-text">{{ version }}</span>
    </div>
    <el-menu-item index="never" :route="{}" @click="toggleCollpase">
      <i :class="`el-icon-s-${collapse ? 'un' : ''}fold`"></i>
      <span slot="title" class="aside__collapse-text">{{ $t(`aside.${collapse ? 'un' : ''}fold`) }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
import throttle from 'lodash/throttle';
import { mapState, mapGetters } from 'vuex';

import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-aside',
  data() {
    return {
      collapse: window.innerWidth < 1580
    };
  },
  computed: {
    ...mapState({
      /** @type { () => SDWC.Config[] } */
      config: state => state.config,
      /** @type { () => SDWC.PlanInfo[] } */
      plans: state => state.plan.info,
      /** @type { () => SDWC.PlanRunning[] } */
      running: state => state.plan.running
    }),
    ...mapGetters([
      'drones',
      'depots'
    ]),
    /** @returns {string} */
    activeIndex() {
      const { name, params: { id } } = this.$route;
      switch (name) {
        case 'overview':
          return 'overview';
        case 'node':
          return `${name}-${id}`;
        case 'plan/view':
        case 'plan/edit':
          return `plan-${id}`;
        case 'plan/new':
          return 'plan-new';
      }
      return '';
    },
    /** @returns {{ [planId: string]: boolean }} */
    isPlanRunning() {
      const result = {};
      for (const r of this.running) {
        result[r.id] = true;
      }
      return result;
    },
    /** @returns {string} */
    version() {
      return __SDWC__VERSION__; // would be replaced on compile
    }
  },
  methods: {
    toggleCollpase() {
      this.collapse = !this.collapse;
    }
  },
  mounted() {
    const fn = () => {
      this.collapse = window.innerWidth < 1580;
    };
    this.resizeListener = throttle(fn, 300);
    window.addEventListener('resize', this.resizeListener, { passive: true });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.aside__menu {
  border: none;
  overflow: hidden auto;
  display: flex;
  flex-direction: column;
}
/* fix collapse animation */
.aside__menu:not(.el-menu--collapse) {
  width: 200px;
}
.aside__header {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.aside__logo {
  width: 50px;
  height: 50px;
  margin: 25px;
}
.aside__subtitle {
  padding: 7px 0 7px 20px;
  font-size: 14px;
  color: #ccc;
}
.aside__version {
  margin-top: auto;
  position: relative;
  min-height: 22px;
}
.aside__version-text {
  position: absolute;
  bottom: 0;
  left: 26px;
  color: white;
  opacity: 0.5;
  font-size: 12px;
  white-space: nowrap;
}
.el-menu--collapse .aside__logo {
  width: 32px;
  height: 32px;
  margin: 14px;
}
.sd--safari .aside__menu {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
/* active menu item indicator on left side */
.el-menu--collapse .el-submenu.is-active,  /* collpased active submenu */
.el-submenu.is-active:not(.is-opened),     /* active but not opened submenu */
.el-menu-item.is-active                    /* active menu item */ {
  box-shadow: inset 4px 0 0 #28b3e4;
  background-color: #434a50 !important;
}
.el-menu-item.is-running {
  background-image: repeating-linear-gradient(45deg, #ffffff25, #ffffff25 10px, transparent 10px, transparent 20px);
}
.el-submenu.is-active .el-submenu__title {
  background: none !important;
}
/* popup menu max height */
.el-menu--vertical .el-menu--popup-right-start {
  max-height: 454px;
  overflow-y: auto;
}
.sd--safari .el-menu--vertical .el-menu--popup-right-start {
  -webkit-overflow-scrolling: touch;
}
/* fix aside overflow on Firefox */
.aside__collapse-text {
  line-height: 0;
}
</style>
