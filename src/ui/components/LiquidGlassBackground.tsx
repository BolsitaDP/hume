import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { withAlpha } from '../glass';
import { AppTheme } from '../theme';

export default function LiquidGlassBackground() {
  const theme = useTheme() as AppTheme;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[ styles.base, { backgroundColor: theme.colors.background } ]} />

      <View
        style={[
          styles.topOverlay,
          { backgroundColor: withAlpha(theme.colors.surfaceVariant, theme.dark ? 0.14 : 0.08) },
        ]}
      />

      <View
        style={[
          styles.bottomOverlay,
          { backgroundColor: withAlpha('#000000', theme.dark ? 0.22 : 0.06) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 220,
  },
});