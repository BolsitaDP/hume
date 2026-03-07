import { create } from 'zustand';
import { loadJSON, saveJSON } from '../services/storage';
import { AppLocale, getDeviceLocale, setI18nLocale } from '../i18n';

export type MotivationStyle = 'positive' | 'negative';

type SettingsState = {
  themeMode: 'system' | 'light' | 'dark';
  hydrated: boolean;
  locale: AppLocale;
  toneLevel: 0 | 1 | 2 | 3;
  motivationStyle: MotivationStyle;
  hasSeenWelcome: boolean;

  notificationsEnabled: boolean;
  // HH:mm (24h)
  notificationTime: string;

  setThemeMode: (mode: 'system' | 'light' | 'dark') => Promise<void>;

  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
  setToneLevel: (level: 0 | 1 | 2 | 3) => Promise<void>;
  setMotivationStyle: (style: MotivationStyle) => Promise<void>;
  setHasSeenWelcome: (seen: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;
};

const STORAGE_KEY = '@humiliateMe/settings_v1';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  themeMode: 'dark',
  locale: getDeviceLocale(),
  toneLevel: 1,
  motivationStyle: 'positive',
  hasSeenWelcome: false,
  notificationsEnabled: true,
  notificationTime: '09:00',

  hydrate: async () => {
    const saved = await loadJSON<Partial<SettingsState>>(STORAGE_KEY);
    const locale = (saved?.locale as any) ?? get().locale;
    const hasSeenWelcome = saved?.hasSeenWelcome ?? false;
    const themeMode = (saved as any)?.themeMode ?? 'dark';
    const motivationStyle = (saved as any)?.motivationStyle ?? 'positive';

    set({
      ...saved,
      locale,
      hasSeenWelcome,
      themeMode,
      motivationStyle,
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

  setMotivationStyle: async (motivationStyle) => {
    set({ motivationStyle });
    await saveJSON(STORAGE_KEY, { ...get(), motivationStyle });
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

  setThemeMode: async (themeMode) => {
    set({ themeMode });
    await saveJSON(STORAGE_KEY, { ...get(), themeMode });
  },
}));


