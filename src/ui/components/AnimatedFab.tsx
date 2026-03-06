import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { AppTheme } from '../theme';
import { glassFloating, withAlpha } from '../glass';

type Props = {
  expanded: boolean;
  label: string;
  onPress: () => void;
  icon?: string;
  iconOnly?: boolean;
  backgroundColor?: string;
  textColor?: string;
  textColorLight?: string;
  textColorDark?: string;
};

export default function AnimatedFab({
  expanded,
  label,
  onPress,
  icon = 'plus',
  iconOnly = false,
  backgroundColor,
  textColor,
  textColorLight,
  textColorDark,
}: Props) {
  const theme = useTheme() as AppTheme;
  const anim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [ expanded, anim ]);

  const width = iconOnly ? 56 : anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 56, 180 ],
  });

  const labelOpacity = anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 0, 1 ],
  });

  const labelTranslateX = anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ -8, 0 ],
  });

  const bg = (backgroundColor ?? theme.colors.elevation.level3) as string;
  const toLower = (s: string) => (s || '').toLowerCase();
  const colors: any = theme.colors;
  const autoOnColor = (
    toLower(bg) === toLower(colors.primary) ? colors.onPrimary
      : toLower(bg) === toLower(colors.error) ? colors.onError
        : colors.success && toLower(bg) === toLower(colors.success) ? colors.onSuccess
          : theme.colors.onSurface
  );

  const onColor = textColor ?? (theme.dark ? (textColorDark ?? autoOnColor) : (textColorLight ?? autoOnColor));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          ...glassFloating(theme),
          width,
          backgroundColor: bg,
          borderColor: withAlpha(theme.colors.outlineVariant, 0.82),
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.inner} activeOpacity={0.84}>
        <View style={styles.iconSlot}>
          <Icon source={icon} color={onColor} size={24} />
        </View>

        {!iconOnly && (
          <Animated.View
            style={{
              opacity: labelOpacity,
              transform: [ { translateX: labelTranslateX } ],
              paddingRight: 18,
            }}
            pointerEvents={expanded ? 'auto' : 'none'}
          >
            <Text
              variant="labelLarge"
              style={{ color: onColor, fontWeight: '700', letterSpacing: 0.3 }}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  iconSlot: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
