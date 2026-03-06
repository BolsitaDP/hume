import React from 'react';
import { View } from 'react-native';
import { Button, ProgressBar, Text, useTheme } from 'react-native-paper';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { AppTheme } from '../theme';
import { glassPanel, withAlpha } from '../glass';

type Props = { url: string };

export default function AudioPlayer({ url }: Props) {
  const theme = useTheme() as AppTheme;
  const player = useAudioPlayer(url, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const isLoaded = status.isLoaded;
  const isPlaying = status.playing;
  const currentSeconds = Number.isFinite(status.currentTime) ? status.currentTime : 0;
  const durationSeconds = Number.isFinite(status.duration) ? status.duration : 0;
  const position = isLoaded ? Math.max(0, Math.floor(currentSeconds * 1000)) : 0;
  const duration = isLoaded ? Math.max(0, Math.floor(durationSeconds * 1000)) : 0;

  function togglePlay() {
    if (!isLoaded) return;
    if (isPlaying) {
      player.pause();
      return;
    }
    if (duration > 0 && position >= duration) {
      void player.seekTo(0);
    }
    player.play();
  }

  const progress = duration ? position / duration : 0;

  return (
    <View
      style={{
        ...glassPanel(theme, 'soft'),
        padding: 12,
        backgroundColor: theme.colors.elevation.level2,
        borderRadius: 18,
      }}
    >
      <Button mode="contained-tonal" icon={isPlaying ? 'pause' : 'play'} onPress={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>

      <ProgressBar progress={progress} style={{ marginTop: 10, borderRadius: 999 }} color={theme.colors.primary} />

      <Text style={{ marginTop: 6, color: theme.colors.onSurfaceVariant }}>
        {formatMillis(position)} / {formatMillis(duration)}
      </Text>
    </View>
  );
}

function formatMillis(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
