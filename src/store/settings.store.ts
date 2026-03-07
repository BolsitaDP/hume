import { create } from 'zustand';
import { loadJSON, saveJSON } from '../services/storage';
import { AppLocale, getDeviceLocale, setI18nLocale } from '../i18n';
import type { HabitCategory } from './habits.store';

export type MotivationStyle = 'positive' | 'negative';
export type ToneLevel = 0 | 1 | 2 | 3;

export type CustomMessageRule = {
  id: string;
  text: string;
  styles: MotivationStyle[];
  tones: ToneLevel[];
  categories: HabitCategory[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

type SettingsState = {
  themeMode: 'system' | 'light' | 'dark';
  hydrated: boolean;
  locale: AppLocale;
  toneLevel: ToneLevel;
  motivationStyle: MotivationStyle;
  customMessageRules: CustomMessageRule[];
  hasSeenWelcome: boolean;

  notificationsEnabled: boolean;
  // HH:mm (24h)
  notificationTime: string;

  setThemeMode: (mode: 'system' | 'light' | 'dark') => Promise<void>;

  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
  setToneLevel: (level: ToneLevel) => Promise<void>;
  setMotivationStyle: (style: MotivationStyle) => Promise<void>;
  addCustomMessageRule: (payload: {
    text: string;
    styles: MotivationStyle[];
    tones: ToneLevel[];
    categories: HabitCategory[];
  }) => Promise<void>;
  updateCustomMessageRule: (
    id: string,
    payload: {
      text: string;
      styles: MotivationStyle[];
      tones: ToneLevel[];
      categories: HabitCategory[];
      enabled?: boolean;
    }
  ) => Promise<void>;
  removeCustomMessageRule: (id: string) => Promise<void>;
  toggleCustomMessageRule: (id: string, enabled: boolean) => Promise<void>;
  setHasSeenWelcome: (seen: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;
};

const STORAGE_KEY = '@humiliateMe/settings_v1';
const ALL_STYLES: MotivationStyle[] = [ 'positive', 'negative' ];
const ALL_TONES: ToneLevel[] = [ 0, 1, 2, 3 ];
const ALL_CATEGORIES: HabitCategory[] = [ 'study', 'exercise', 'health', 'work', 'personal', 'discipline' ];

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function unique<T extends string | number>(arr: T[]) {
  return Array.from(new Set(arr));
}

function sanitizeStyles(styles?: MotivationStyle[]): MotivationStyle[] {
  const safe = unique((styles ?? []).filter((x): x is MotivationStyle => ALL_STYLES.includes(x))) as MotivationStyle[];
  return safe.length ? safe : [ 'negative' ];
}

function sanitizeTones(tones?: ToneLevel[]): ToneLevel[] {
  const safe = unique((tones ?? []).filter((x): x is ToneLevel => ALL_TONES.includes(x))) as ToneLevel[];
  return safe.length ? safe : [ 1 ];
}

function sanitizeCategories(categories?: HabitCategory[]): HabitCategory[] {
  const safe = unique((categories ?? []).filter((x): x is HabitCategory => ALL_CATEGORIES.includes(x))) as HabitCategory[];
  return safe.length ? safe : [ 'exercise' ];
}

function sanitizeCustomRules(rules: unknown): CustomMessageRule[] {
  if (!Array.isArray(rules)) return [];

  return rules
    .map((raw) => {
      const row = raw as Partial<CustomMessageRule>;
      const text = String(row?.text ?? '').trim();
      if (!text) return null;

      const createdAt = Number.isFinite(row.createdAt) ? Number(row.createdAt) : Date.now();
      const updatedAt = Number.isFinite(row.updatedAt) ? Number(row.updatedAt) : createdAt;

      return {
        id: String(row.id ?? uid()),
        text,
        styles: sanitizeStyles(row.styles),
        tones: sanitizeTones(row.tones),
        categories: sanitizeCategories(row.categories),
        enabled: row.enabled ?? true,
        createdAt,
        updatedAt,
      } as CustomMessageRule;
    })
    .filter((x): x is CustomMessageRule => !!x);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  themeMode: 'dark',
  locale: getDeviceLocale(),
  toneLevel: 1,
  motivationStyle: 'positive',
  customMessageRules: [],
  hasSeenWelcome: false,
  notificationsEnabled: true,
  notificationTime: '09:00',

  hydrate: async () => {
    const saved = await loadJSON<Partial<SettingsState>>(STORAGE_KEY);
    const locale = (saved?.locale as any) ?? get().locale;
    const hasSeenWelcome = saved?.hasSeenWelcome ?? false;
    const themeMode = (saved as any)?.themeMode ?? 'dark';
    const motivationStyle = (saved as any)?.motivationStyle ?? 'positive';
    const customMessageRules = sanitizeCustomRules((saved as any)?.customMessageRules);

    set({
      ...saved,
      locale,
      hasSeenWelcome,
      themeMode,
      motivationStyle,
      customMessageRules,
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

  addCustomMessageRule: async ({ text, styles, tones, categories }) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    const nextRule: CustomMessageRule = {
      id: uid(),
      text: trimmed,
      styles: sanitizeStyles(styles),
      tones: sanitizeTones(tones),
      categories: sanitizeCategories(categories),
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };

    const next = [ nextRule, ...get().customMessageRules ];
    set({ customMessageRules: next });
    await saveJSON(STORAGE_KEY, { ...get(), customMessageRules: next });
  },

  updateCustomMessageRule: async (id, payload) => {
    const trimmed = payload.text.trim();
    if (!trimmed) return;

    const next = get().customMessageRules.map((rule) => {
      if (rule.id !== id) return rule;

      return {
        ...rule,
        text: trimmed,
        styles: sanitizeStyles(payload.styles),
        tones: sanitizeTones(payload.tones),
        categories: sanitizeCategories(payload.categories),
        enabled: payload.enabled ?? rule.enabled,
        updatedAt: Date.now(),
      };
    });

    set({ customMessageRules: next });
    await saveJSON(STORAGE_KEY, { ...get(), customMessageRules: next });
  },

  removeCustomMessageRule: async (id) => {
    const next = get().customMessageRules.filter((rule) => rule.id !== id);
    set({ customMessageRules: next });
    await saveJSON(STORAGE_KEY, { ...get(), customMessageRules: next });
  },

  toggleCustomMessageRule: async (id, enabled) => {
    const next = get().customMessageRules.map((rule) =>
      rule.id === id ? { ...rule, enabled, updatedAt: Date.now() } : rule
    );
    set({ customMessageRules: next });
    await saveJSON(STORAGE_KEY, { ...get(), customMessageRules: next });
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


