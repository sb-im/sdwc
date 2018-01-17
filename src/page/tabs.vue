<template>
  <div>
    <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
      <el-tab-pane
        v-for="(item, index) in this.$store.state.links"
        :key="item.name"
        :label="item.name"
        :name="item.id"
      >
        <div v-for="video in item.video">
          <monitor-img :source="video"></monitor-img>
        </div>
        {{item.content}}
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import MonitorImg from '../components/monitor-img.vue'


  export default {
    props: {
      node: {
        type: Object,
        default: 'vertical'
      }
    },
    components: {
      'monitor-img': MonitorImg
    },
    data() {
      return {
        activeTab: '1'
      }
    },
    methods: {
      removeTab(id) {

        this.otherActive(id)
        this.$store.commit("linkdel", id)
      },
      otherActive(targetName) {
        // Delete the tab focus transfer other tab

        let tabs = this.$store.state.links
        let activeName = this.activeTab
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.id === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.id
              }
            }
          })
        }

        //console.log(activeName)
        this.activeTab = activeName;
      }
    }
  }
</script>
