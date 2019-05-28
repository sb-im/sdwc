import Vue from 'vue';
import I18n from 'vue-i18n';

import {zhLocale, zhDtFormat} from './locale/zh';
import {enLocale, enDtFormat} from './locale/en';

Vue.use(I18n);

const i18n = new I18n({
  locale: 'en',
  messages: {
    'en': enLocale,
    'zh': zhLocale,
    'zh-cn': zhLocale
  },
  dateTimeFormats: {
    'en': enDtFormat,
    'zh': zhDtFormat,
    'zh-cn': zhDtFormat
  }
});

export default i18n;

export function setLocale(locale) {
  i18n.locale = locale;
  document.body.lang = locale;
}
