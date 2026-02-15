import { create } from 'zustand';
import { loadJSON, saveJSON } from '../services/storage';
import { detectMotivationKind, getYouTubeId, MotivationKind, resolveMotivationThumbnail } from '../utils/motivation';

export type MotivationItem = {
  id: string;
  kind: MotivationKind;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  createdAt: number;
};

type MotivationState = {
  items: MotivationItem[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addItem: (payload: { url: string; kind?: MotivationKind; title?: string }) => Promise<MotivationItem | null>;
  removeItem: (id: string) => Promise<void>;
  getRandomItem: (kind?: MotivationKind) => MotivationItem | null;
  updateTitle: (id: string, title: string) => Promise<void>;
};

const STORAGE_KEY = '@humiliateMe/motivation_v1';

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useMotivationStore = create<MotivationState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    const data = await loadJSON<MotivationItem[]>(STORAGE_KEY);
    const loaded = data ?? [];
    set({ items: loaded, hydrated: true });

    const needBackfill = loaded.some((item) =>
      !item.thumbnailUrl && (item.kind === 'youtube' || item.kind === 'tiktok')
    );
    if (!needBackfill) return;

    const resolved = await Promise.all(
      loaded.map(async (item) => {
        if (item.thumbnailUrl) return item;
        if (item.kind !== 'youtube' && item.kind !== 'tiktok') return item;

        const thumbnailUrl = await resolveMotivationThumbnail(item.kind, item.url);
        return thumbnailUrl ? { ...item, thumbnailUrl } : item;
      })
    );

    const changed = resolved.some((item, idx) => item.thumbnailUrl !== loaded[ idx ]?.thumbnailUrl);
    if (!changed) return;

    set({ items: resolved });
    await saveJSON(STORAGE_KEY, resolved);
  },

  addItem: async ({ url, kind, title }) => {
    const trimmed = (url ?? '').trim();
    if (!trimmed) return null;

    let resolved: MotivationKind | null = kind ?? detectMotivationKind(trimmed);

    if (!resolved) {
      // special case: YouTube-like but parser didn't flag
      if (trimmed.includes('youtu')) {
        const id = getYouTubeId(trimmed);
        if (id) resolved = 'youtube';
      }
    }

    if (!resolved) return null; // UI should prompt user to pick kind

    const thumbnailUrl = await resolveMotivationThumbnail(resolved, trimmed);

    const item: MotivationItem = {
      id: uid(),
      kind: resolved,
      url: trimmed,
      thumbnailUrl,
      title: title?.trim() || undefined,
      createdAt: Date.now(),
    };

    const next = [item, ...get().items];
    set({ items: next });
    await saveJSON(STORAGE_KEY, next);
    return item;
  },

  removeItem: async (id) => {
    const next = get().items.filter((x) => x.id !== id);
    set({ items: next });
    await saveJSON(STORAGE_KEY, next);
  },

  getRandomItem: (kind) => {
    const pool = kind ? get().items.filter((x) => x.kind === kind) : get().items;
    if (!pool.length) return null;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  },

  updateTitle: async (id, title) => {
    const trimmed = (title ?? '').trim();
    const next = get().items.map((x) => (x.id === id ? { ...x, title: trimmed || undefined } : x));
    set({ items: next });
    await saveJSON(STORAGE_KEY, next);
  },
}));
