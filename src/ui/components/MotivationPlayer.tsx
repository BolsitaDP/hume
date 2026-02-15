import React from 'react';
import { Image, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

import { MotivationItem } from '../../store/motivation.store';
import { getYouTubeEmbedUrl } from '../../utils/motivation';
import AudioPlayer from './AudioPlayer';

type Props = {
  item: MotivationItem;
  onFallbackOpen?: () => void;
};

export default function MotivationPlayer({ item, onFallbackOpen }: Props) {
  if (!item) return null as any;

  if (item.kind === 'youtube') {
    const embed = getYouTubeEmbedUrl(item.url);
    if (!embed) return <Text>Invalid YouTube URL</Text> as any;
    return (
      <View style={{ height: 220, borderRadius: 6, overflow: 'hidden' }}>
        <WebView
          source={{ uri: embed }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
        />
      </View>
    );
  }

  if (item.kind === 'tiktok') {
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

  if (item.kind === 'instagram') {
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
      <View style={{ height: 240, borderRadius: 6, overflow: 'hidden', backgroundColor: '#0002' }}>
        <Image source={{ uri: item.url }} style={{ flex: 1 }} resizeMode="cover" />
      </View>
    );
  }

  if (item.kind === 'audio') {
    return <AudioPlayer url={item.url} />;
  }

  return <Text>Unsupported item</Text> as any;
}
