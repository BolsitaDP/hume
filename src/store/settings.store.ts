import { create } from 'zustand';
import { loadJSON, saveJSON } from '../services/storage';
import { AppLocale, getDeviceLocale, setI18nLocale } from '../i18n';

type SettingsState = {
  hydrated: boolean;
  locale: AppLocale;
  toneLevel: 0 | 1 | 2 | 3;
  hasSeenWelcome: boolean;

  notificationsEnabled: boolean;
  // HH:mm (24h)
  notificationTime: string;

  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
  setToneLevel: (level: 0 | 1 | 2 | 3) => Promise<void>;
  setHasSeenWelcome: (seen: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;
};

const STORAGE_KEY = '@humiliateMe/settings_v1';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  locale: getDeviceLocale(),
  toneLevel: 1,
  hasSeenWelcome: false,
  notificationsEnabled: true,
  notificationTime: '09:00',

  hydrate: async () => {
    const saved = await loadJSON<Partial<SettingsState>>(STORAGE_KEY);
    const locale = (saved?.locale as any) ?? get().locale;
    const hasSeenWelcome = saved?.hasSeenWelcome ?? false;

    set({
      ...saved,
      locale,
      hasSeenWelcome,
      hydrated: true,
    });

    setI18nLocale(locale);
  },

  setLocale: async (locale) => {
    set({ locale });
    setI18nLocale(locale);
    await saveJSON(STORAGE_KEY, { ...get(), locale });
  },

  setToneLevel: async (toneLevel) => {
    set({ toneLevel });
    await saveJSON(STORAGE_KEY, { ...get(), toneLevel });
  },

  setHasSeenWelcome: async (hasSeenWelcome) => {
    set({ hasSeenWelcome });
    await saveJSON(STORAGE_KEY, { ...get(), hasSeenWelcome });
  },

  setNotificationsEnabled: async (notificationsEnabled) => {
    set({ notificationsEnabled });
    await saveJSON(STORAGE_KEY, { ...get(), notificationsEnabled });
  },

  setNotificationTime: async (notificationTime) => {
    set({ notificationTime });
    await saveJSON(STORAGE_KEY, { ...get(), notificationTime });
  },
}));
