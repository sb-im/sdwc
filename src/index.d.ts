import Vue from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $mqtt: (id: number, ctl: SDWC.ControlItem) => Promise<void>;
  }
}
