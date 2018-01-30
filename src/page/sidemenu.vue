<template>
  <div>
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
          <span>飞机</span>
        </template>
        <div v-for="item in items" v-if="item.type_name == 'air'">
          <el-menu-item :index="item.id">{{ item.name }}</el-menu-item>
        </div >
      </el-submenu>
      <el-submenu index="depot">
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span>机场</span>
        </template>

        <div v-for="item in items" v-if="item.type_name == 'depot'">
          <el-menu-item :index="item.id">{{ item.name }}</el-menu-item>
        </div >
      </el-submenu>

      <el-menu-item index="log">
        <i class="el-icon-menu"></i>
        <span slot="title">日志</span>
      </el-menu-item>

    </el-menu>
  </div>
</template>

<script>

  export default {
    data() {
      return {
        config: {},
        items: []
      }
    },
    created: function () {
      this.getItems()
    },
    methods: {
      handleSelect(key, keyPath) {
        this.$emit('select')
        //console.log(key, keyPath)
        for (let item of this.items) {
          //console.log(String(keyPath))
          //console.log(typeof(item.id))
          if (keyPath[1] == item.id) {
            //console.log(item.id)
            this.$store.commit("linkadd", item)
          }
        }
        //this.$store.commit("linkadd", response.data)
        //console.log("SSSSSSSSSSS");
      },
      handleOpen(key, keyPath) {
        //console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        //console.log(key, keyPath);
      },
      getItems() {
        //console.log("getItems")
        //let api_url = "/node_config.json"
        let api_url = this.$store.state.config.server + "/nodes" + this.$store.state.config.suffix
        //console.log(api_url)
        this.$http.get(api_url)
        .then((response) => {
          //console.log(response.data)
          this.items = response.data
          this.$store.commit("items", response.data)
        })
        .catch((error) => {
          console.log(error)
        })
      },
      getNodeConfig: function () {
          console.log(this.$store.state.config.token)
        //var _this = this
        //this.$http.get(this.config.api_url)
        //console.log(location.host)
        //let api_url = "/node_config.json"
        let api_url = this.$store.state.config.server + "/nodes"
        this.$http.get(api_url)
        .then((response) => {
          this.items = response.data
        })
        .catch((error) => {
          console.log(error)
        })

        /*
        .then(function (response) {
          //console.log(_this.aaa)
          console.log(response.data)
          _this.items = response.data
        })
        .catch(function (error) {
          console.log(error)
        })
        */
      }
    }
  }
</script>

