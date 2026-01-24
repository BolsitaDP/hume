
export type MotivationKind = 'youtube' | 'tiktok' | 'image' | 'audio';

// YouTube helpers
export function getYouTubeId(input: string): string | null {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname.startsWith('/watch')) {
        const id = url.searchParams.get('v');
        return id || null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/').filter(Boolean)[1];
        return id || null;
      }
    }
    return null;
  } catch {
    // naive fallback
    const m = input.match(/(?:youtu\.be\/|v=|shorts\/)([A-Za-z0-9_-]{6,})/);
    return m?.[1] ?? null;
  }
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// TikTok helpers (best-effort)
export function getTikTokEmbedUrl(input: string): string {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '');
    if (host.endsWith('tiktok.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const ix = parts.indexOf('video');
      if (ix >= 0 && parts[ix + 1]) {
        const videoId = parts[ix + 1];
        return `https://www.tiktok.com/embed/v2/${videoId}`;
      }
    }
  } catch {}
  return input; // fallback to original URL (open externally if needed)
}

export function detectMotivationKind(raw: string): MotivationKind | null {
  const url = raw.trim();
  if (!url) return null;

  const lower = url.toLowerCase();

  if (lower.includes('youtube.com/watch?v=') || lower.includes('youtu.be/') || lower.includes('youtube.com/shorts/')) {
    return 'youtube';
  }

  if (lower.includes('tiktok.com/')) {
    return 'tiktok';
  }

  if (/(\.jpg|\.jpeg|\.png|\.webp|\.gif)(\?.*)?$/i.test(lower)) {
    return 'image';
  }

  if (/(\.mp3|\.wav|\.m4a|\.aac|\.ogg)(\?.*)?$/i.test(lower)) {
    return 'audio';
  }

  return null;
}

export function isProbablyEmbeddable(kind: MotivationKind): boolean {
  if (kind === 'youtube') return true;
  if (kind === 'tiktok') return true; // try, but have fallback
  return true; // image/audio are rendered in-app
}