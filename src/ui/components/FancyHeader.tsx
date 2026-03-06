import React from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

import { withAlpha } from '../glass';
import { AppTheme } from '../theme';

interface FancyHeaderProps {
  height?: number | Animated.Value | Animated.AnimatedInterpolation<string | number>;
  radius?: number;
  edgeWidth?: number;
  color?: string;
  cutoutColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function FancyHeader({
  height = 80,
  radius = 20,
  edgeWidth = 14,
  color,
  cutoutColor,
  style,
  children,
}: FancyHeaderProps) {
  const theme = useTheme() as AppTheme;
  const headerColor = color ?? theme.colors.header;

  return (
    <Animated.View style={[ { height: height as any, position: 'relative', overflow: 'hidden' }, style ]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: headerColor,
            borderBottomColor: theme.colors.headerEdge,
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
          },
        ]}
      />

      <View
        style={[
          styles.topTone,
          {
            backgroundColor: withAlpha(theme.colors.onHeader, theme.dark ? 0.06 : 0.1),
          },
        ]}
      />

      <View style={[ styles.content, { right: edgeWidth + 12, backgroundColor: cutoutColor ? withAlpha(cutoutColor, 0) : 'transparent' } ]}>
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  topTone: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
  },
  content: {
    position: 'absolute',
    top: 24,
    left: 16,
    bottom: 12,
    justifyContent: 'center',
  },
});