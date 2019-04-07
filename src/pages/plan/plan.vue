<template>
  <div>This is Plan#{{this.id}}</div>
</template>

<script>
export default {
  name: 'sd-plan',
  props: {
    id: {
      type: Number,
      required: true
    }
  }
};
</script>

<style>

</style>
