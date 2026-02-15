import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ShareIntent, useShareIntentContext } from 'expo-share-intent';

import { useMotivationStore } from '../store/motivation.store';
import { detectMotivationKind } from '../utils/motivation';

function extractFirstUrl(text?: string | null): string | null {
  if (!text) return null;
  const m = text.match(/https?:\/\/[\w.-]+(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?/i);
  return m?.[0] ?? null;
}

function extractFirstSupportedFile(data: ShareIntent): { path: string; mimeType: string } | null {
  const file = data.files?.find((f) =>
    f?.mimeType?.startsWith('image/') || f?.mimeType?.startsWith('audio/')
  );

  if (!file?.path || !file?.mimeType) return null;
  return { path: file.path, mimeType: file.mimeType };
}

export default function ShareIntentHandler() {
  const navigation = useNavigation<any>();
  const hydrate = useMotivationStore((s) => s.hydrate);
  const addItem = useMotivationStore((s) => s.addItem);

  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    (async () => {
      if (!hasShareIntent || !shareIntent) return;
      await hydrate();

      const data = shareIntent as ShareIntent;
      let url: string | null = data.webUrl || extractFirstUrl(data.text) || null;
      let kind = url ? detectMotivationKind(url) || undefined : undefined;

      if (!url || !kind) {
        const sharedFile = extractFirstSupportedFile(data);
        if (sharedFile) {
          url = sharedFile.path;
          if (sharedFile.mimeType.startsWith('image/')) kind = 'image';
          if (sharedFile.mimeType.startsWith('audio/')) kind = 'audio';
        }
      }

      if (!url) return;

      const created = await addItem({ url, kind, title: data.meta?.title ?? undefined });
      if (created) {
        navigation.navigate('UrgentMotivation');
      }
      resetShareIntent();
    })();
  }, [hasShareIntent, shareIntent, resetShareIntent, navigation, hydrate, addItem]);

  return null;
}
