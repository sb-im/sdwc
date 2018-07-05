<template>
  <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="8">
    <div v-for="cmd in commands">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" style="margin: 12px 0">
        <el-button type="success" plain @click="send(cmd.value)" :loading=cmd.status>{{ cmd.name }}</el-button>
      </el-col>
    </div>
  </el-col>
</template>
<script>
  export default {
    props: {
      commands: {
        type: Array,
        default: Array
      }
    },
    methods: {
      send(cmd) {
        this.$emit('cmd-send', cmd)
        // console.log(cmd)
      }
    }

  }
</script>

