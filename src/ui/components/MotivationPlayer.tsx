import React from 'react';
import { Image, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

import { MotivationItem } from '../../store/motivation.store';
import { getYouTubeEmbedUrl } from '../../utils/motivation';
import { t } from '../../i18n';
import AudioPlayer from './AudioPlayer';
import { AppTheme } from '../theme';

type Props = {
  item: MotivationItem;
  onFallbackOpen?: () => void;
};

export default function MotivationPlayer({ item, onFallbackOpen }: Props) {
  const theme = useTheme() as AppTheme;

  if (!item) return null as any;

  if (item.kind === 'youtube') {
    const embed = getYouTubeEmbedUrl(item.url);
    if (!embed) return <Text>Invalid YouTube URL</Text> as any;

    return (
      <View
        style={{
          height: 220,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          overflow: 'hidden',
          backgroundColor: theme.colors.elevation.level1,
        }}
      >
        <WebView
          source={{ uri: embed }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
    );
  }

  if (item.kind === 'tiktok' || item.kind === 'instagram') {
    return (
      <Button
        mode="contained-tonal"
        icon="open-in-new"
        onPress={async () => {
          await WebBrowser.openBrowserAsync(item.url);
          onFallbackOpen?.();
        }}
      >
        {t('motivation.open_external')}
      </Button>
    );
  }

  if (item.kind === 'image') {
    return (
      <View
        style={{
          height: 240,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          overflow: 'hidden',
          backgroundColor: theme.colors.elevation.level1,
        }}
      >
        <Image source={{ uri: item.url }} style={{ flex: 1 }} resizeMode="cover" />
      </View>
    );
  }

  if (item.kind === 'audio') {
    return <AudioPlayer url={item.url} />;
  }

  return <Text>Unsupported item</Text> as any;
}
