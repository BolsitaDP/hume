import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import WebView from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

import { MotivationItem } from '../../store/motivation.store';
import { getTikTokEmbedUrl, getYouTubeEmbedUrl } from '../../utils/motivation';
import AudioPlayer from './AudioPlayer';

type Props = {
  item: MotivationItem;
  onFallbackOpen?: () => void;
};

export default function MotivationPlayer({ item, onFallbackOpen }: Props) {
  const [tiktokFailed, setTikTokFailed] = useState(false);

  useEffect(() => {
    setTikTokFailed(false);
  }, [item?.id]);

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
    const [timedOut, setTimedOut] = useState(false);
    useEffect(() => {
      const id = setTimeout(() => setTimedOut(true), 4000);
      return () => clearTimeout(id);
    }, [item?.id]);

    const uri = getTikTokEmbedUrl(item.url);
    const showFallback = tiktokFailed || timedOut;

    return (
      <View>
        {showFallback ? (
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
        ) : (
          <View style={{ height: 420, borderRadius: 6, overflow: 'hidden' }}>
            <WebView
              source={{ uri }}
              onError={() => setTikTokFailed(true)}
              onHttpError={() => setTikTokFailed(true)}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
            />
          </View>
        )}
      </View>
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