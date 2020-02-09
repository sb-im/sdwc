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
      <img class="aside__logo" src="/assets/images/logo-100.png" />
    </div>
    <el-menu-item index="overview" :route="{ name: 'overview' }">
      <sd-icon value="info-circle"></sd-icon>
      <span slot="title">{{ $t('sidemenu.overview') }}</span>
    </el-menu-item>
    <el-submenu index="plan">
      <template #title>
        <sd-icon value="tasks-blue"></sd-icon>
        <span>{{ $t('sidemenu.plan') }}</span>
      </template>
      <li v-if="collapse" class="aside__subtitle">{{ $t('sidemenu.plan') }}</li>
      <el-menu-item :index="`plan-new`" :route="{ name: 'plan/new' }">
        <i class="el-icon-plus"></i>
        <span>{{ $t('plan.edit.add') }}</span>
      </el-menu-item>
      <el-menu-item
        v-for="plan in plans"
        :key="plan.id"
        :index="`plan-${plan.id}`"
        :route="{ name: 'plan', params: { id: plan.id } }"
      >{{ plan.name }}</el-menu-item>
    </el-submenu>
    <el-submenu index="drone">
      <template #title>
        <sd-icon value="drone-blue"></sd-icon>
        <span slot="title">{{ $t('sidemenu.air') }}</span>
      </template>
      <li v-if="collapse" class="aside__subtitle">{{ $t('sidemenu.air') }}</li>
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
        <span slot="title">{{ $t('sidemenu.depot') }}</span>
      </template>
      <li v-if="collapse" class="aside__subtitle">{{ $t('sidemenu.depot') }}</li>
      <el-menu-item
        v-for="depot in depots"
        :key="depot.info.id"
        :index="`node-${depot.info.id}`"
        :route="{ name: 'node', params: { id: depot.info.id } }"
      >{{ depot.info.name }}</el-menu-item>
    </el-submenu>
    <el-menu-item class="aside__toggle" @click="toggleCollpase">
      <i :class="`el-icon-s-${collapse ? 'un' : ''}fold`"></i>
      <span slot="title">{{ $t(`sidemenu.${collapse ? 'un' : ''}fold`) }}</span>
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
      collapse: true
    };
  },
  computed: {
    ...mapState({
      plans: state => state.plan.info
    }),
    ...mapGetters([
      'drones',
      'depots'
    ]),
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
    }
  },
  methods: {
    toggleCollpase() {
      this.collapse = !this.collapse;
    }
  },
  created() {
    const fn = () => {
      this.collapse = window.innerWidth < 1580;
    };
    fn();
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
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.aside__logo {
  width: 50px;
  height: 50px;
}
.aside__subtitle {
  padding: 7px 0 7px 20px;
  font-size: 14px;
  color: #ccc;
}
.aside__toggle {
  margin-top: auto;
}
.el-menu--collapse .aside__header {
  min-height: 60px;
}
.el-menu--collapse .aside__logo {
  width: 32px;
  height: 32px;
}
.sd--safari .aside__menu {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
.el-menu--collapse .el-submenu.is-active,
.el-menu .el-menu-item.is-active {
  box-shadow: inset 4px 0 0 #28b3e4, inset 200px 0 0 #434a50;
}
.el-menu--collapse .el-submenu.is-active .el-submenu__title {
  background: none !important;
}
</style>
