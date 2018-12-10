<template>
  <img :src="source" />
</template>

<script>
  export default {
    data() {
      return {}
    },
    props: {
      source: {
        type: String,
        required: true,
        default: ''
      }
    }
  }
</script>
