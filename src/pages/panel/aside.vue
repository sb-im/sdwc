<template>
  <div class="aside">
    <div class="aside-header">
      <img class="aside-logo" src="/assets/images/logo-100.png" />
    </div>
    <el-menu
      class="aside-menu"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#fff"
      :default-active="activeIndex"
      router
    >
      <el-menu-item index="overview" :route="{ name: 'overview' }">
        <sd-icon value="info-circle"></sd-icon>
        <span>{{ $t('sidemenu.overview') }}</span>
      </el-menu-item>
      <el-submenu index="plan">
        <template #title>
          <sd-icon value="task"></sd-icon>
          <span>{{ $t('sidemenu.plan') }}</span>
        </template>
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
          <span>{{ $t('sidemenu.air') }}</span>
        </template>
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
          <span>{{ $t('sidemenu.depot') }}</span>
        </template>
        <el-menu-item
          v-for="depot in depots"
          :key="depot.info.id"
          :index="`node-${depot.info.id}`"
          :route="{ name: 'node', params: { id: depot.info.id } }"
        >{{ depot.info.name }}</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-aside',
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
  components: {
    [Icon.name]: Icon
  }
};
</script>

<style>
.aside {
  background-color: #545c64;
  display: flex;
  flex-direction: column;
}

.aside-header {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aside-logo {
  width: 50px;
  height: 50px;
}

.aside-menu {
  border: none;
  overflow: hidden auto;
  flex-grow: 1;
}

.aside .el-menu-item.is-active {
  box-shadow: inset 4px 0 0 #28b3e4, inset 200px 0 0 rgba(0, 0, 0, 0.2);
}
</style>
