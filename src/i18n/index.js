import Vue from 'vue';
import I18n from 'vue-i18n';

import { format } from './common';
import * as zh from './locale/zh';
import * as en from './locale/en';

Vue.use(I18n);

const i18n = new I18n({
  locale: navigator.language.split('-')[0],
  messages: {
    'en': en.default,
    'zh': zh.default
  },
  dateTimeFormats: {
    'en': format,
    'zh': format
  }
});

export default i18n;

export const locales = {
  en: en.name,
  zh: zh.name
};

export function setLocale(locale) {
  i18n.locale = locale;
  document.body.lang = locale;
}
