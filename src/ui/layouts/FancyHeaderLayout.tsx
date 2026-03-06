import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import FancyHeader from '../components/FancyHeader';
import { AppTheme } from '../theme';

interface FancyHeaderLayoutProps {
  title?: string;
  subtitle?: string;
  headerChildren?: React.ReactNode;
  expandedPct?: number;
  collapsedPct?: number;
  scrollDistance?: number;
  contentPadding?: number;
  bottomPadding?: number;
  isEmpty?: boolean;
  headerColor?: string;
  collapsedTitleOffset?: number;
  collapsedSubtitleOffset?: number;
  children: React.ReactNode;
  onScrollY?: (y: number) => void;
}

export default function FancyHeaderLayout({
  title,
  subtitle,
  headerChildren,
  expandedPct = 0.21,
  collapsedPct = 0.11,
  scrollDistance = 90,
  contentPadding = 16,
  bottomPadding = 120,
  isEmpty,
  headerColor,
  collapsedTitleOffset = 10,
  collapsedSubtitleOffset = 10,
  children,
  onScrollY,
}: FancyHeaderLayoutProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme() as AppTheme;

  const screenHeight = Dimensions.get('window').height;
  const headerExpanded = Math.round(screenHeight * expandedPct);
  const headerCollapsed = Math.round(screenHeight * collapsedPct);
  const headerHeight = scrollY.interpolate({
    inputRange: [ 0, scrollDistance ],
    outputRange: [ headerExpanded, headerCollapsed ],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [ 0, scrollDistance * 0.6, scrollDistance ],
    outputRange: [ 1, 0, 0 ],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [ 0, scrollDistance ],
    outputRange: [ 8, collapsedTitleOffset ],
    extrapolate: 'clamp',
  });

  const subtitleTranslateY = scrollY.interpolate({
    inputRange: [ 0, scrollDistance ],
    outputRange: [ 0, collapsedSubtitleOffset ],
    extrapolate: 'clamp',
  });

  const onScroll = useMemo(
    () =>
      Animated.event([ { nativeEvent: { contentOffset: { y: scrollY } } } ], {
        useNativeDriver: false,
        listener: (e: any) => {
          const y = e?.nativeEvent?.contentOffset?.y ?? 0;
          onScrollY?.(y);
        },
      }),
    [ scrollY, onScrollY ]
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: contentPadding,
          paddingBottom: bottomPadding,
          flexGrow: 1,
          justifyContent: isEmpty ? 'center' : 'flex-start',
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ height: headerHeight as any, marginHorizontal: -contentPadding }} />
        {children}
      </Animated.ScrollView>

      <FancyHeader
        height={headerHeight}
        color={headerColor ?? theme.colors.header}
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
      >
        {headerChildren ?? (
          <>
            {!!title && (
              <Animated.View style={{ transform: [ { translateY: titleTranslateY } ] }}>
                <Text variant="headlineMedium" style={{ color: theme.colors.onHeader, fontWeight: '800' }}>
                  {title}
                </Text>
              </Animated.View>
            )}

            {!!subtitle && (
              <Animated.View style={{ opacity: subtitleOpacity, transform: [ { translateY: subtitleTranslateY } ] }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onHeader, opacity: 0.86, marginTop: 6 }}>
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
