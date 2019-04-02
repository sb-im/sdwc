<template>
  <el-aside class="aside" width="200px">
    <div class="aside-header">
      <img class="aside-logo" src="/assets/images/header/logo.png">`
    </div>
    <el-menu class="aside-menu" background-color="#545c64" text-color="#ccc">
      <el-submenu index="plan">
        <template slot="title">
          <sd-icon value="aside/task"></sd-icon>
          <span>{{ $t('sidemenu.plan') }}</span>
        </template>
        <el-menu-item
          v-for="plan in plans"
          :key="plan.id"
          :index="`plan-${plan.id}`"
        >{{ plan.name }}</el-menu-item>
      </el-submenu>
      <el-submenu index="depot">
        <template slot="title">
          <sd-icon value="aside/airport"></sd-icon>
          <span>{{ $t('sidemenu.depot') }}</span>
        </template>
        <el-menu-item
          v-for="depot in depots"
          :key="depot.id"
          :index="`depot-${depot.id}`"
        >{{ depot.name }}</el-menu-item>
      </el-submenu>
      <el-submenu index="drone">
        <template slot="title">
          <sd-icon value="aside/drone"></sd-icon>
          <span>{{ $t('sidemenu.air') }}</span>
        </template>
        <el-menu-item
          v-for="drone in drones"
          :key="drone.id"
          :index="`drone-${drone.id}`"
        >{{ drone.name }}</el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Icon from '../../components/sd-icon.vue';

export default {
  computed: {
    ...mapState({
      plans: state => state.plan.info
    }),
    ...mapGetters([
      'drones',
      'depots'
    ])
  },
  components: {
    'sd-icon': Icon
  }
};
</script>

<style>
.aside {
  min-height: 100vh;
  background-color: #545c64;
}

.aside-header {
  height: 100px;
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
}
</style>
