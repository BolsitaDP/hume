import React from 'react';
import { Image, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

import { MotivationItem } from '../../store/motivation.store';
import { getYouTubeEmbedUrl } from '../../utils/motivation';
import AudioPlayer from './AudioPlayer';
import { AppTheme } from '../theme';
import { glassPanel, withAlpha } from '../glass';

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
          ...glassPanel(theme, 'soft'),
          height: 220,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: theme.colors.elevation.level2,
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
        mode="contained"
        icon="open-in-new"
        onPress={async () => {
          await WebBrowser.openBrowserAsync(item.url);
          onFallbackOpen?.();
        }}
      >
        Open externally
      </Button>
    );
  }

  if (item.kind === 'image') {
    return (
      <View
        style={{
          ...glassPanel(theme, 'soft'),
          height: 240,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: theme.colors.elevation.level2,
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
