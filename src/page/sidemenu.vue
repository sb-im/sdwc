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
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-star-on"></i>
          <span>导航一</span>
        </template>
        <el-menu-item-group>
          <template slot="title">分组一</template>
          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group title="分组2">
          <el-menu-item index="1-3">选项3</el-menu-item>
        </el-menu-item-group>

        <el-submenu index="1-8">
          <template slot="title">old飞机</template>
          <div v-for="item in items" v-show="item.type == 'air'">
            <el-menu-item index="1-4-1">{{ item.name }}</el-menu-item>
          </div >
        </el-submenu>
        <el-submenu index="1-4">
          <template slot="title">old机场</template>
          <div v-for="item in items" v-show="item.type == 'depot'">
            <el-menu-item index="1-4-1">{{ item.name }}</el-menu-item>
          </div >
        </el-submenu>

      </el-submenu>


      <el-submenu index="233">
        <template slot="title">
          <i class="el-icon-tickets"></i>
          <span>飞机</span>
        </template>
        <div v-for="item in items" v-show="item.type == 'air'">
          <el-menu-item :index="item.id">{{ item.name }}</el-menu-item>
        </div >
      </el-submenu>

      <el-submenu index="2233">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>机场</span>
        </template>

        <div v-for="item in items" v-show="item.type == 'depot'">
          <el-menu-item :index="item.id">{{ item.name }}</el-menu-item>
        </div >
      </el-submenu>



      <el-menu-item index="aa">
        <i class="el-icon-menu"></i>
        <span slot="title">导航二</span>
      </el-menu-item>
      <el-menu-item index="3">
        <i class="el-icon-setting"></i>
        <span slot="title">导航三</span>
      </el-menu-item>
    </el-menu>

  </div>
</template>

<script>

  export default {
    data() {
      return {
        config: {},
        items: [],
        activeIndex: '1',
        activeIndex2: '1'
      };
    },
    created: function () {
      this.getItems()
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
        console.log("SSSSSSSSSSS");
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
        console.log("OOOOOOOOOOO");
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
        console.log("CCCCCCCCCCC");
      },
      getItems: function () {
        //console.log("getItems")
        //console.log(this.$store.state.config.server)
        let api_url = "/node_config.json"
        //let api_url = this.$store.state.config.server + "/nodes"
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
        //axios.get(api_url)
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

