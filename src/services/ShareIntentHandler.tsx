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
      if (!url) return;

      const kind = detectMotivationKind(url) || undefined;
      const created = await addItem({ url, kind, title: data.meta?.title ?? undefined });
      if (created) {
        navigation.navigate('UrgentMotivation');
      }
      resetShareIntent();
    })();
  }, [hasShareIntent, shareIntent, resetShareIntent, navigation, hydrate, addItem]);

  return null;
}