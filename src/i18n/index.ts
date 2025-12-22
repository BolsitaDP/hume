import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { en } from './translations/en';
import { es } from './translations/es';

export type AppLocale = 'en' | 'es' | 'ar';

export const i18n = new I18n({ en, es });
i18n.enableFallback = true;

export function getDeviceLocale(): AppLocale {
  const tag = Localization.getLocales()?.[ 0 ]?.languageCode ?? 'en';
  if (tag === 'es' || tag === 'ar') return tag;
  return 'en';
}

export function setI18nLocale(locale: AppLocale) {
  i18n.locale = locale;
}

// helper
export function t(key: string, options?: Record<string, any>) {
  return i18n.t(key, options);
}
