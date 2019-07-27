<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
    <g v-if="speed === 0">
      <circle cx="20" cy="20" r="10.5" stroke="#4e7ab5" fill="transparent" />
      <circle cx="20" cy="20" r="4.5" stroke="#4e7ab5" fill="#8bb7f0" />
    </g>
    <g v-else :transform="transform">
      <line x1="20" y1="0" x2="20" y2="7.7" stroke="#4e7ab5" stroke-width="1" v-if="barb[0] !== 4" />
      <line x1="20" y1="7.7" x2="20" y2="33" stroke="#4e7ab5" stroke-width="1" />
      <circle cx="20" cy="35" r="4" stroke="#4e7ab5" fill="#8bb7f0" />
      <template v-for="(val, index) in barb">
        <polygon
          v-if="val === 20"
          :key="index"
          :points="`20,${0.5 + index*5} 28,${0.5 + index*5} 20,${6.5 + index*5}`"
          stroke="#4e7ab5"
          fill="#8bb7f0"
        />
        <line
          v-if="val === 4"
          :key="index"
          x1="28"
          :y1="2 + index*5"
          x2="20"
          :y2="8 + index*5"
          stroke="#4e7ab5"
          stroke-width="1"
        />
        <line
          v-if="val === 2"
          :key="index"
          x1="25"
          :y1="4.3 + index*5"
          x2="20"
          :y2="8 + index*5"
          stroke="#4e7ab5"
          stroke-width="1"
        />
      </template>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'sd-weather-wind-icon',
  props: {
    speed: {
      type: Number,
      default: 0
    },
    direction: {
      type: Number,
      default: 0
    }
  },
  computed: {
    transform() {
      return `rotate(${this.direction} 20 20)`;
    },
    barb() {
      const barb = [];
      let remain = Math.round(this.speed) || 0;
      if (remain <= 1) return [];
      if (remain % 2) remain += 1;
      while (remain > 0) {
        let it = 0;
        if (remain >= 20) it = 20;
        else if (remain >= 4) it = 4;
        else if (remain >= 2) it = 2;
        remain -= it;
        barb.push(it);
      }
      return barb;
    }
  }
};
</script>

<style>
</style>
