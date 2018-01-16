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
        default: 'vertical'
      }
    }


  }


</script>
