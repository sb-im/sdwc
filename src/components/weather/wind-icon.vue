<template>
  <svg width="80" height="80">
    <g>
      <line x1="40" y1="10" x2="40" y2="70" class="ct-grid"></line>
      <line x1="10" y1="40" x2="70" y2="40" class="ct-grid"></line>
      <text x="36" y="9" class="ct-label">N</text>
      <text x="36" y="80" class="ct-label">S</text>
      <text x="0" y="44" class="ct-label">W</text>
      <text x="72" y="44" class="ct-label">E</text>
    </g>
    <g v-if="speed === 0">
      <circle cx="40" cy="40" r="10.5" class="wind-line" />
      <circle cx="40" cy="40" r="4.5" class="wind-fill" />
    </g>
    <g v-else :transform="transform">
      <line x1="20" y1="0" x2="20" y2="7.7" class="wind-line" v-if="barb[0] !== 4" />
      <line x1="20" y1="7.7" x2="20" y2="33" class="wind-line" />
      <circle cx="20" cy="35" r="4" class="wind-fill" />
      <template v-for="(val, index) in barb">
        <polygon
          v-if="val === 20"
          :key="index"
          :points="`20,${0.5 + index*5} 28,${0.5 + index*5} 20,${6.5 + index*5}`"
          class="wind-fill"
        />
        <line
          v-if="val === 4"
          :key="index"
          x1="28"
          :y1="2 + index*5"
          x2="20"
          :y2="8 + index*5"
          class="wind-line"
        />
        <line
          v-if="val === 2"
          :key="index"
          x1="25"
          :y1="4.3 + index*5"
          x2="20"
          :y2="8 + index*5"
          class="wind-line"
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
      return `translate(20 5)\nrotate(${this.direction} 20 35)`;
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
.wind-line {
  stroke: #4e7ab5;
  fill: none;
}
.wind-fill {
  stroke: #4e7ab5;
  fill: #8bb7f0;
}
</style>
