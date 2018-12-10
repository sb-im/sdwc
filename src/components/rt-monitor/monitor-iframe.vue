<template>
  <iframe
    width="100%"
    height="100%"
    frameborder="0"
    allowfullscreen="true"
    webkitallowfullscreen="true"
    mozallowfullscreen="true"
    :src="source"></iframe>
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
