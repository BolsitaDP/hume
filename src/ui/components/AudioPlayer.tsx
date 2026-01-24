import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, ProgressBar, Text } from 'react-native-paper';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';

type Props = { url: string };

export default function AudioPlayer({ url }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: false }, (status) => {
        if (!mounted) return;
        if (!status.isLoaded) return;
        const s = status as AVPlaybackStatusSuccess;
        setPosition(s.positionMillis ?? 0);
        setDuration(s.durationMillis ?? 0);
        setIsPlaying(s.isPlaying);
      });
      soundRef.current = sound;
    })();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [url]);

  async function togglePlay() {
    const snd = soundRef.current;
    if (!snd) return;
    const status = await snd.getStatusAsync();
    if ('isLoaded' in status && status.isLoaded) {
      if (status.isPlaying) {
        await snd.pauseAsync();
      } else {
        await snd.playAsync();
      }
    }
  }

  const progress = duration ? position / duration : 0;

  return (
    <View style={{ padding: 12 }}>
      <Button mode="contained-tonal" icon={isPlaying ? 'pause' : 'play'} onPress={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
      <ProgressBar progress={progress} style={{ marginTop: 8 }} />
      <Text style={{ marginTop: 4 }}>
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