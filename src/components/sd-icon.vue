<template>
  <img class="el-icon-__custom" :src="imgSrc" :width="size" :height="size">
</template>

<script>
export default {
  name: 'sd-icon',
  props: {
    value: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: false,
      default: 24
    }
  },
  computed: {
    imgSrc() {
      return `/assets/icons/${this.value}.svg`;
    }
  }
};
</script>
