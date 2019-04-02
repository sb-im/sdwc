import Vue from 'vue';
import I18n from 'vue-i18n';

import zhLocale from './locale/zh';
import enLocale from './locale/en';

Vue.use(I18n);

export default new I18n({
  locale: 'en',
  messages: {
    'en': enLocale,
    'zh-cn': zhLocale
  }
});
