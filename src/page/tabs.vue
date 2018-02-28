<template>
  <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
    <el-tab-pane
      v-for="(item, index) in this.$store.state.links"
      :key="item.name"
      :label="item.name"
      :name="String(item.id)"
    >
      <sd-content :node="item"></sd-content>
      {{ item.content }}
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import Content from './content.vue'


  export default {
    props: {
      node: {
        type: Object,
        default: Object
      }
    },
    components: {
      'sd-content': Content
    },
    data() {
      return {
        activeTab: '1'
      }
    },
    methods: {
      removeTab(id) {
        //console.log(typeof(id))

        this.activeTab = this.otherActive(id, this.activeTab, this.$store.state.links)
        this.$store.commit("linkdel", Number(id))
      },
      otherActive(targetName, activeName, tabs) {
        // Delete the tab focus transfer other tab

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

        return activeName
      }

    }
  }
</script>
