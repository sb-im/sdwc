<template>
  <el-menu
    class="aside__menu"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#fff"
    :default-active="activeIndex"
    :collapse="collapse"
    @select="handleSelect"
    router
  >
    <div class="aside__header">
      <img v-if="config.aside_logo" class="aside__logo" :src="config.aside_logo" />
    </div>
    <template v-for="(item, index) of ui.sidebar">
      <!-- type: overview -->
      <el-menu-item
        :key="index"
        v-if="item.type === 'overview'"
        :index="`${index}`"
        :route="{ name: 'overview' }"
      >
        <sd-icon :value="item.icon || 'info-circle'"></sd-icon>
        <span slot="title" v-t="'common.overview'"></span>
      </el-menu-item>
      <!-- type: plan -->
      <el-submenu :key="index" v-else-if="item.type === 'plan'" :index="`${index}`">
        <template #title>
          <sd-icon :value="item.icon || 'tasks-blue'"></sd-icon>
          <span v-t="item.name || 'common.plan'"></span>
          <el-badge class="aside__badge" :value="running.length" :hidden="running.length <= 0"></el-badge>
        </template>
        <li v-if="collapse" class="aside__subtitle" v-t="item.name || 'common.plan'"></li>
        <el-menu-item index="plan-new" :route="{ name: 'plan/new' }">
          <i class="el-icon-plus"></i>
          <span v-t="'plan.edit.add'"></span>
        </el-menu-item>
        <el-menu-item
          v-for="plan in orderedPlans"
          :key="plan.id"
          :index="`${index}-plan-${plan.id}`"
          :route="{ name: 'plan', params: { id: plan.id } }"
          :class="{ 'is-running': isPlanRunning[plan.id] }"
        >{{ plan.name }}</el-menu-item>
      </el-submenu>
      <!-- type: node/drone -->
      <el-submenu
        :key="index"
        v-else-if="item.type === 'node' && item.args === 'drone'"
        :index="`${index}`"
      >
        <template #title>
          <sd-icon :value="item.icon || 'drone-blue'"></sd-icon>
          <span slot="title" v-t="item.name || 'common.air'"></span>
        </template>
        <li v-if="collapse" class="aside__subtitle" v-t="item.name || 'common.air'"></li>
        <el-menu-item
          v-for="drone in drones"
          :key="drone.info.id"
          :index="`${index}-node-${drone.info.id}`"
          :route="{ name: 'node', params: { id: drone.info.id } }"
        >{{ drone.info.name }}</el-menu-item>
      </el-submenu>
      <!-- type: node/depot -->
      <el-submenu
        :key="index"
        v-else-if="item.type === 'node' && item.args === 'depot'"
        :index="`${index}`"
      >
        <template #title>
          <sd-icon :value="item.icon || 'depot-blue'"></sd-icon>
          <span slot="title" v-t="item.name || 'common.depot'"></span>
        </template>
        <li v-if="collapse" class="aside__subtitle" v-t="item.name || 'common.depot'"></li>
        <el-menu-item
          v-for="depot in depots"
          :key="depot.info.id"
          :index="`${index}-node-${depot.info.id}`"
          :route="{ name: 'node', params: { id: depot.info.id } }"
        >{{ depot.info.name }}</el-menu-item>
      </el-submenu>
      <!-- type: path -->
      <el-menu-item
        :key="index"
        v-else-if="item.type === 'path'"
        :index="`${index}`"
        :route="{ path: item.args.replace(/^\/?#/, '') }"
      >
        <sd-icon :value="item.icon || 'views'"></sd-icon>
        <span slot="title" v-text="item.name"></span>
      </el-menu-item>
      <!-- type: iframe -->
      <el-menu-item
        :key="index"
        v-else-if="item.type === 'iframe' "
        :index="`${index}`"
        :route="{ name: 'iframe', params: { index } }"
      >
        <sd-icon :value="item.icon || 'doc'"></sd-icon>
        <span slot="title" v-text="item.name"></span>
      </el-menu-item>
    </template>
    <div class="aside__version">
      <template v-if="!collapse">
        <div class="aside__version-text">
          <div v-text="version"></div>
          <div>Powered by Superdock</div>
        </div>
      </template>
    </div>
    <el-menu-item index="never" :route="{}" @click="toggleCollpase">
      <i :class="`el-icon-s-${collapse ? 'un' : ''}fold`"></i>
      <span slot="title" class="aside__collapse-text" v-t="`aside.${collapse ? 'un' : ''}fold`"></span>
    </el-menu-item>
  </el-menu>
</template>

<script>
import throttle from 'lodash/throttle';

import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-aside',
  data() {
    return {
      activeIndex: '',
      collapse: window.innerWidth < 1580
    };
  },
  computed: {
    /** @returns {SDWC.UI} */
    ui() { return this.$store.state.ui; },
    /** @returns {SDWC.Config} */
    config() { return this.$store.state.config; },
    /** @returns {SDWC.PlanInfo[]} */
    plans() { return this.$store.state.plan.info; },
    /** @returns {SDWC.PlanRunning[]} */
    running() { return this.$store.state.plan.running; },
    /** @returns {SDWC.Node[]} */
    drones() { return this.$store.getters.drones; },
    /** @returns {SDWC.Node[]} */
    depots() { return this.$store.getters.depots; },
    /** @returns {{ [planId: string]: boolean }} */
    isPlanRunning() {
      const result = {};
      for (const r of this.running) {
        result[r.id] = true;
      }
      return result;
    },
    /** @returns {SDWC.PlanInfo[]} */
    orderedPlans() {
      const running = [];
      const standby = [];
      for (const p of this.plans) {
        if (this.isPlanRunning[p.id]) running.push(p);
        else standby.push(p);
      }
      return running.concat(standby);
    },
    /** @returns {string} */
    version() {
      return __SDWC__VERSION__; // would be replaced on compile
    }
  },
  methods: {
    /**
     * @param {string} index
     * @param {string[]} indexPath
     */
    handleSelect(index /*, indexPath*/) {
      // TODO: find out current active index on first render
      this.activeIndex = index;
    },
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
.aside__badge {
  position: static;
}
.aside__badge .el-badge__content {
  position: absolute;
}
.aside__badge .el-badge__content {
  left: 140px;
  top: 18px;
}
.el-menu--collapse .aside__badge .el-badge__content {
  top: 10px;
  left: 34px;
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
