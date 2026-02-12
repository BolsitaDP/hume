import React from 'react';
import { View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import FancyHeaderLayout from './FancyHeaderLayout';

type FancyHeaderBackLayoutProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  headerPct?: number;
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
  headerPct = 0.10,
  contentPadding,
  bottomPadding,
  isEmpty,
  headerColor,
  onScrollY,
  children,
}: FancyHeaderBackLayoutProps) {
  const theme = useTheme() as any;

  return (
    <FancyHeaderLayout
      expandedPct={headerPct}
      collapsedPct={headerPct}
      scrollDistance={1}
      contentPadding={contentPadding}
      bottomPadding={bottomPadding}
      isEmpty={isEmpty}
      headerColor={headerColor}
      onScrollY={onScrollY}
      headerChildren={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={onBack}
            iconColor={theme.colors.onHeader}
            style={{ margin: 0, marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onHeader, fontWeight: '700' }}>
              {title}
            </Text>
            {!!subtitle && (
              <Text variant="bodySmall" style={{ color: theme.colors.onHeader, opacity: 0.85, marginTop: 2 }}>
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
