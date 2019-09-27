import 'vue';
import 'vuex';
import 'vue-i18n';
import 'vue-router';
import 'element-ui';

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    $mqtt: (id: number, ctl: SDWC.ControlItem) => Promise<void>;
  }
}
