
export type MotivationKind = 'youtube' | 'tiktok' | 'instagram' | 'image' | 'audio';

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

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
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

export async function getTikTokThumbnailUrl(url: string): Promise<string | null> {
  try {
    const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.thumbnail_url === 'string' ? data.thumbnail_url : null;
  } catch {
    return null;
  }
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

  if (lower.includes('instagram.com/reel/') || lower.includes('instagram.com/p/') || lower.includes('instagram.com/tv/')) {
    return 'instagram';
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
  if (kind === 'instagram') return false; // IG embeds are often blocked in WebView/auth flows
  return true; // image/audio are rendered in-app
}

export async function resolveMotivationThumbnail(kind: MotivationKind, url: string): Promise<string | undefined> {
  if (kind === 'youtube') return getYouTubeThumbnailUrl(url) ?? undefined;
  if (kind === 'tiktok') return (await getTikTokThumbnailUrl(url)) ?? undefined;
  return undefined;
}
