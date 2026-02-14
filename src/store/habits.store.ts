import { create } from 'zustand';
import { loadJSON, saveJSON } from '../services/storage';
import { todayKey } from '../utils/date';
import { cancelNotificationsByTag } from '../services/notifications';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type HabitCategory = 'study' | 'exercise' | 'health' | 'work' | 'personal' | 'discipline';

export type HabitSchedule = {
  days: WeekDay[]; // e.g. ['tue']
  time: string; // '16:00'
};

export type Habit = {
  id: string;
  title: string;
  category: HabitCategory;
  createdAt: number;
  schedule: HabitSchedule;
  completions: Record<string, boolean>; // YYYY-MM-DD -> true
};

type HabitsState = {
  habits: Habit[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addHabit: (payload: { title: string; category: HabitCategory; schedule: HabitSchedule }) => Promise<Habit | null>;
  updateHabit: (habitId: string, payload: { title: string; category: HabitCategory; schedule: HabitSchedule }) => Promise<void>;
  toggleToday: (habitId: string) => Promise<void>;
  toggleCompletionForDate: (habitId: string, dateKey: string) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
};

const STORAGE_KEY = '@humiliateMe/habits_v2';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  hydrated: false,

  hydrate: async () => {
    const data = await loadJSON<Habit[]>(STORAGE_KEY);
    set({ habits: data ?? [], hydrated: true });
  },

  addHabit: async ({ title, category, schedule }) => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    if (!schedule.days?.length) return null;

    const newHabit: Habit = {
      id: uid(),
      title: trimmed,
      category,
      createdAt: Date.now(),
      schedule: {
        days: schedule.days,
        time: schedule.time,
      },
      completions: {},
    };

    const next = [ newHabit, ...get().habits ];
    set({ habits: next });
    await saveJSON(STORAGE_KEY, next);

    return newHabit;
  },

  updateHabit: async (habitId, { title, category, schedule }) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (!schedule.days?.length) return;

    const next = get().habits.map((h) => {
      if (h.id !== habitId) return h;
      return {
        ...h,
        title: trimmed,
        category,
        schedule: {
          days: schedule.days,
          time: schedule.time,
        },
      };
    });

    set({ habits: next });
    await saveJSON(STORAGE_KEY, next);

    // Actualizar notificaciones si es necesario
    await cancelNotificationsByTag(`habit-${habitId}`);
  },

  toggleToday: async (habitId) => {
    const key = todayKey();
    const next = get().habits.map((h) => {
      if (h.id !== habitId) return h;

      const current = !!h.completions[ key ];
      return {
        ...h,
        completions: {
          ...h.completions,
          [ key ]: !current,
        },
      };
    });

    // Actualizar el estado inmediatamente de forma síncrona
    set({ habits: next });

    // Guardar en segundo plano sin bloquear
    saveJSON(STORAGE_KEY, next).catch(err => {
      console.error('Error saving habit completions:', err);
    });
  },

  toggleCompletionForDate: async (habitId, dateKey) => {
    const next = get().habits.map((h) => {
      if (h.id !== habitId) return h;

      const current = !!h.completions[ dateKey ];
      return {
        ...h,
        completions: {
          ...h.completions,
          [ dateKey ]: !current,
        },
      };
    });

    set({ habits: next });

    saveJSON(STORAGE_KEY, next).catch(err => {
      console.error('Error saving habit completions:', err);
    });
  },

  removeHabit: async (habitId) => {
    // cancela notificaciones asociadas
    await cancelNotificationsByTag(`habit-${habitId}`);

    const next = get().habits.filter((h) => h.id !== habitId);
    set({ habits: next });
    await saveJSON(STORAGE_KEY, next);
  },
}));
