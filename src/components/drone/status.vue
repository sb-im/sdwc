<template>
  <sd-status :items="items" :node-id="point.node_id" :notification="msg.notification"></sd-status>
</template>

<script>
import Status from '@/components/status/status.vue';

export default {
  name: 'sd-drone-status',
  props: {
    point: {
      type: Object,
      required: true
    },
    msg: {
      type: Object,
      required: true
    }
  },
  computed: {
    flightStatus() {
      const key = `air.status.${this.msg.drone_status.status}`;
      return this.$te(key) ? this.$t(key) : this.msg.drone_status.status;
    },
    flightMode() {
      const key = `air.mode.${this.msg.drone_status.mode}`;
      return this.$t(this.$te(key) ? key : 'air.mode.unknown');
    },
    flightTime() {
      const { time } = this.msg.drone_status;
      /** @type {Intl.DateTimeFormatOptions} */
      const options = {
        timeZone: 'UTC',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      if (time >= 3600) options.hour = 'numeric';
      return new Date(time * 1000).toLocaleString('en-US', options);
    },
    items() {
      const s = this.msg.drone_status;
      return [
        {
          icon: 'drone',
          value: this.flightStatus
        },
        {
          icon: 'check-flag',
          value: this.flightMode
        },
        {
          icon: 'timespan',
          name: 'air.flight.time',
          value: this.flightTime
        },
        {
          icon: 'speed',
          name: 'air.flight.speed',
          value: s.speed.toFixed(2),
          unit: 'm/s'
        },
        {
          icon: 'battery-horizontal',
          name: 'air.battery.remain',
          value: s.battery.percent.toFixed(1),
          unit: '%'
        },
        {
          icon: 'voltage',
          name: 'air.battery.voltage',
          value: s.battery.voltage.toFixed(2),
          unit: 'V'
        },
        {
          icon: 'height',
          name: 'air.flight.height',
          value: s.height.toFixed(2),
          unit: 'm'
        },
        {
          icon: 'signal',
          name: 'air.signal',
          value: s.signal
        },
        {
          icon: 'satellite',
          value: this.$t('air.gps.satellites', s.gps)
        }
      ];
    },
  },
  components: {
    [Status.name]: Status
  }
};
</script>
