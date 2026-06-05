import messages from '@intlify/unplugin-vue-i18n/messages';
import { get } from '@vueuse/core';
import type { Plugin } from 'vue';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';

const STORAGE_KEY = 'locale';
const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

const i18n = createI18n({
  legacy: false,
  locale: savedLocale ?? 'en',
  messages,
});

watch(
  i18n.global.locale,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    }
    catch {
      // localStorage may be unavailable (e.g. SSR or storage disabled).
    }
  },
  { immediate: true },
);

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? i18n.global.t(localeKey) : localeKey;
};
