import React from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface FancyHeaderProps {
  height?: number | Animated.Value | Animated.AnimatedInterpolation<string | number>;
  radius?: number;
  edgeWidth?: number;
  color?: string;       // override opcional del color base
  cutoutColor?: string; // override opcional del color del recorte
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function FancyHeader({
  height = 80,
  radius = 36,
  edgeWidth = 14,
  color,
  cutoutColor,
  style,
  children,
}: FancyHeaderProps) {
  const theme = useTheme() as any;
  const headerColor = color ?? (theme?.colors?.header ?? theme?.colors?.primary);

  return (
    <Animated.View style={[ { height: height as any, position: 'relative', overflow: 'visible' }, style ]}>
      {/* Base */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: headerColor }} />

      {/* Contenido */}
      <View style={{ position: 'absolute', top: 32, left: 16, right: edgeWidth + 16, bottom: 16, justifyContent: 'center' }}>
        {children}
      </View>
    </Animated.View>
  );
}
