<template>
  <el-menu
    default-active="2"
    class="el-menu-vertical-demo"
    @select="handleSelect"
    @open="handleOpen"
    @close="handleClose"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">

    <el-submenu index="air">
      <template slot="title">
        <i class="el-icon-tickets"></i>
        <span>{{ $t('sidemenu.air') }}</span>
      </template>
      <div v-for="item in items" v-if="item.type_name == 'air'">
        <el-menu-item :index="String(item.id)">{{ item.name }}</el-menu-item>
      </div >
    </el-submenu>
    <el-submenu index="depot">
      <template slot="title">
        <i class="el-icon-setting"></i>
        <span>{{ $t('sidemenu.depot') }}</span>
      </template>

      <div v-for="item in items" v-if="item.type_name == 'depot'">
        <el-menu-item :index="String(item.id)">{{ item.name }}</el-menu-item>
      </div >
    </el-submenu>

    <el-menu-item index="log">
      <i class="el-icon-menu"></i>
      <span slot="title">{{ $t('sidemenu.log') }}</span>
    </el-menu-item>

  </el-menu>
</template>

<script>
  export default {
    data() {
      return {
        config: {},
        items: []
      }
    },
    created() {
      this.getItems()
    },
    methods: {
      handleSelect(key, keyPath) {
        this.$emit('select')
        //console.log(key, keyPath)
        for (let item of this.items) {
          if (keyPath[1] == item.id) {
            this.$store.commit("linkadd", item)
          }
        }
      },
      handleOpen(key, keyPath) {
        //console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        //console.log(key, keyPath);
      },
      getItems() {
        //console.log("getItems")
        let api_url = this.$store.state.api.nodes
        this.$http.get(api_url)
        .then((response) => {
          this.items = response.data
          this.$store.commit("items", response.data)
        })
        .catch((error) => {
          console.log(error)
        })
      }

    }
  }
</script>
