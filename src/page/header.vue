<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu"
    mode="horizontal"
    @select="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-menu-item index="1">SDWC</el-menu-item>
    <el-menu-item index="2-1"><router-link to="/app">{{ $t('header.dashboard') }}</router-link></el-menu-item>
    <el-menu-item index="2-2"><router-link to="/login">{{ $t('header.logout') }}</router-link></el-menu-item>
    <el-menu-item index="3"><a href="https://www.sb.im" target="_blank">{{ $t('header.index') }}</a></el-menu-item>
  </el-menu>
</template>

<script>
  export default {
    data() {
      return {
        activeIndex: '1'
      }
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

