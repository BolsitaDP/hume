import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

type Props = {
  expanded: boolean;
  label: string;
  onPress: () => void;
  icon?: string;
  iconOnly?: boolean;
  backgroundColor?: string;
  textColor?: string;         // override global
  textColorLight?: string;    // override when theme is light
  textColorDark?: string;     // override when theme is dark
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
  const theme = useTheme();
  const anim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // width uses layout, can't be native driver
    }).start();
  }, [ expanded, anim ]);

  const width = iconOnly ? 56 : anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 56, 168 ], // colapsado -> extendido
  });

  const labelOpacity = anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 0, 1 ],
  });

  const labelTranslateX = anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ -8, 0 ],
  });

  const bg = (backgroundColor ?? (theme as any).colors.primary) as string;
  const toLower = (s: string) => (s || '').toLowerCase();
  const colors: any = (theme as any).colors || {};
  const autoOnColor = (
    toLower(bg) === toLower(colors.primary) ? colors.onPrimary
    : toLower(bg) === toLower(colors.error) ? colors.onError
    : colors.success && toLower(bg) === toLower(colors.success) ? colors.onSuccess
    : colors.onPrimary
  );
  const onColor = textColor ?? ((theme as any).dark ? (textColorDark ?? autoOnColor) : (textColorLight ?? autoOnColor));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          backgroundColor: bg,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.inner}>
        <View style={styles.iconSlot}>
          <Icon
            source={icon}
            color={onColor}
            size={24}
          />
        </View>

        {!iconOnly && (
          <Animated.View
            style={{
              opacity: labelOpacity,
              transform: [ { translateX: labelTranslateX } ],
              paddingRight: 16,
            }}
            pointerEvents={expanded ? 'auto' : 'none'}
          >
            <Text
              variant="labelLarge"
              style={{ color: onColor }}
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
    borderRadius: 28,
    elevation: 6, // Android shadow
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
