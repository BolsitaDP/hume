import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import FancyHeader from '../components/FancyHeader';

interface FancyHeaderLayoutProps {
  title?: string;
  subtitle?: string;
  headerChildren?: React.ReactNode; // si se pasa, reemplaza title/subtitle
  expandedPct?: number; // 0.25 por defecto
  collapsedPct?: number; // 0.10 por defecto
  scrollDistance?: number; // píxeles para comprimir, 120 por defecto
  contentPadding?: number; // 16 por defecto
  bottomPadding?: number; // 120 por defecto
  isEmpty?: boolean; // para centrar verticalmente
  headerColor?: string;
  children: React.ReactNode;
  onScrollY?: (y: number) => void; // callback para que pantallas reaccionen
}

export default function FancyHeaderLayout({
  title,
  subtitle,
  headerChildren,
  expandedPct = 0.20,
  collapsedPct = 0.10,
  scrollDistance = 80,
  contentPadding = 16,
  bottomPadding = 10,
  isEmpty,
  headerColor,
  children,
  onScrollY,
}: FancyHeaderLayoutProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme() as any;

  const screenHeight = Dimensions.get('window').height;
  const HEADER_EXPANDED = Math.round(screenHeight * expandedPct);
  const HEADER_COLLAPSED = Math.round(screenHeight * collapsedPct);
  const headerHeight = scrollY.interpolate({
    inputRange: [ 0, scrollDistance ],
    outputRange: [ HEADER_EXPANDED, HEADER_COLLAPSED ],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [ 0, scrollDistance * 0.6, scrollDistance ],
    outputRange: [ 1, 0, 0 ],
    extrapolate: 'clamp',
  });

  const onScroll = useMemo(
    () =>
      Animated.event([ { nativeEvent: { contentOffset: { y: scrollY } } } ], {
        useNativeDriver: false, // animamos height/opacity
        listener: (e: any) => {
          const y = e?.nativeEvent?.contentOffset?.y ?? 0;
          onScrollY?.(y);
        },
      }),
    [ scrollY, onScrollY ]
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          padding: contentPadding,
          paddingBottom: bottomPadding,
          flexGrow: 1,
          justifyContent: isEmpty ? 'center' : 'flex-start',
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Espaciador para que el contenido arranque bajo el header */}
        <Animated.View style={{ height: headerHeight as any, marginHorizontal: -contentPadding }} />

        {children}
      </Animated.ScrollView>

      {/* Header fijo y visible siempre */}
      <FancyHeader
        height={headerHeight}
        color={headerColor}
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
      >
        {headerChildren ?? (
          <>
            {!!title && (
              <Text variant="headlineMedium" style={{ color: theme.colors.onHeader, fontWeight: '700' }}>
                {title}
              </Text>
            )}
            {!!subtitle && (
              <Animated.View style={{ opacity: subtitleOpacity }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onHeader, opacity: 0.85, marginTop: 4 }}>
                  {subtitle}
                </Text>
              </Animated.View>
            )}
          </>
        )}
      </FancyHeader>
    </View>
  );
}

