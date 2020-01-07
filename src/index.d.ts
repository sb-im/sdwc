import Vue from 'vue';

import { mqtt } from '@/util/plugin-mqtt'

declare module 'vue/types/vue' {
  interface Vue {
    $mqtt: typeof mqtt;
  }
}
