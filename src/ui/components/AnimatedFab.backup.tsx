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
};

export default function AnimatedFab({ expanded, label, onPress, icon = 'plus', iconOnly = false, backgroundColor }: Props) {
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

  const paddingHorizontal = anim.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 0, 16 ],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          backgroundColor: backgroundColor || theme.colors.primary,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={[ styles.inner, { paddingHorizontal } ]}>
        <View style={[ styles.iconContainer, iconOnly && styles.iconOnly ]}>
          <Icon
            source={icon}
            color={theme.colors.onPrimary}
            size={24}
          />

          {!iconOnly && (
            <Animated.View
              style={{
                opacity: labelOpacity,
                transform: [ { translateX: labelTranslateX } ],
                marginLeft: 2,
              }}
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onPrimary }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Animated.View>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconOnly: {
    backgroundColor: 'red'
  },
});