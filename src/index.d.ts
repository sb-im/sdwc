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

namespace SDWC {
  import { ButtonType } from 'element-ui/types/button';
  export interface ControlItem {
    /** `vue-i18n` string name */
    name: string;
    /** `vue-i18n` string values */
    values?: any;
    /** mission name */
    mission: string;
    /** mission arguments. default: `[]` */
    arg?: any;
    /** display button type. default: `warning` */
    type?: ButtonType;
  }
}
