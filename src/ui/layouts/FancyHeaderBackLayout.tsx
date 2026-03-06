import React from 'react';
import { View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

import FancyHeaderLayout from './FancyHeaderLayout';
import { AppTheme } from '../theme';

type FancyHeaderBackLayoutProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  headerPct?: number;
  collapsedTitleOffset?: number;
  collapsedSubtitleOffset?: number;
  contentPadding?: number;
  bottomPadding?: number;
  isEmpty?: boolean;
  headerColor?: string;
  onScrollY?: (y: number) => void;
  children: React.ReactNode;
};

export default function FancyHeaderBackLayout({
  title,
  subtitle,
  onBack,
  headerPct = 0.11,
  collapsedTitleOffset = 10,
  collapsedSubtitleOffset = 0,
  contentPadding,
  bottomPadding,
  isEmpty,
  headerColor,
  onScrollY,
  children,
}: FancyHeaderBackLayoutProps) {
  const theme = useTheme() as AppTheme;

  return (
    <FancyHeaderLayout
      expandedPct={headerPct}
      collapsedPct={headerPct}
      scrollDistance={1}
      contentPadding={contentPadding}
      bottomPadding={bottomPadding}
      isEmpty={isEmpty}
      headerColor={headerColor}
      collapsedTitleOffset={collapsedTitleOffset}
      collapsedSubtitleOffset={collapsedSubtitleOffset}
      onScrollY={onScrollY}
      headerChildren={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="arrow-left"
            size={22}
            onPress={onBack}
            iconColor={theme.colors.onHeader}
            style={{ margin: 0, marginRight: 10, marginTop: collapsedTitleOffset + 6 }}
            containerColor="transparent"
          />

          <View style={{ flex: 1 }}>
            <Text
              variant="headlineSmall"
              style={{ color: theme.colors.onHeader, fontWeight: '800', transform: [ { translateY: collapsedTitleOffset } ] }}
            >
              {title}
            </Text>

            {!!subtitle && (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onHeader, opacity: 0.82, marginTop: 2, transform: [ { translateY: collapsedSubtitleOffset } ] }}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      }
    >
      {children}
    </FancyHeaderLayout>
  );
}
