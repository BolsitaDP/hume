import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

type Props = {
  expanded: boolean;
  label: string;
  onPress: () => void;
};

export default function AnimatedFab({ expanded, label, onPress }: Props) {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // width uses layout, can't be native driver
    }).start();
  }, [ expanded, anim ]);

  const width = anim.interpolate({
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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <View style={styles.inner}>
        <IconButton
          icon="plus"
          iconColor={theme.colors.onPrimary}
          size={24}
          onPress={onPress}
          style={{ margin: 0 }}
        />

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
      </View>
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
    paddingRight: 16,
  },
});
