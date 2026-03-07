import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import AllHabitsScreen from '../screens/AllHabitsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { AppTheme } from '../ui/theme';
import { withAlpha } from '../ui/glass';

export type TabsParamList = {
  HomeTab: undefined;
  AllHabitsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();
const TAB_HEIGHT = 68;

type IconRendererProps = {
  size: number;
  color: string;
  focused: boolean;
};

type MaterialTabIconProps = {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>[ 'name' ];
  size: number;
  color: string;
  focused: boolean;
  theme: AppTheme;
  sizeBoost?: number;
};

function MaterialTabIcon({
  iconName,
  size,
  color,
  focused,
  theme,
  sizeBoost,
}: MaterialTabIconProps) {
  const progress = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [ focused, progress ]);

  const indicatorOpacity = progress.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 0, 1 ],
  });

  const indicatorScaleX = progress.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 0.82, 1 ],
  });

  const indicatorScaleY = progress.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 0.9, 1 ],
  });

  const iconScale = progress.interpolate({
    inputRange: [ 0, 1 ],
    outputRange: [ 1, 1.05 ],
  });

  return (
    <View style={styles.iconWrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeIndicator,
          {
            opacity: indicatorOpacity,
            transform: [ { scaleX: indicatorScaleX }, { scaleY: indicatorScaleY } ],
            backgroundColor: withAlpha(theme.colors.secondaryContainer, theme.dark ? 0.84 : 0.98),
          },
        ]}
      />

      <Animated.View style={{ transform: [ { scale: iconScale } ] }}>
        <MaterialCommunityIcons
          name={iconName}
          size={size + (sizeBoost ?? 0)}
          color={color}
        />
      </Animated.View>
    </View>
  );
}

export default function TabsNavigator() {
  const locale = useSettingsStore((s) => s.locale);
  const theme = useTheme() as AppTheme;

  const labels = React.useMemo(
    () => ({
      today: t('nav.today'),
      allHabits: t('nav.all_habits'),
      settings: t('nav.settings'),
    }),
    [ locale ]
  );

  const renderIcon = (
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>[ 'name' ],
    sizeBoost = 0
  ) =>
    ({ size, color, focused }: IconRendererProps) => (
      <MaterialTabIcon
        iconName={iconName}
        size={size}
        color={color}
        focused={focused}
        theme={theme}
        sizeBoost={sizeBoost}
      />
    );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle: {
          height: TAB_HEIGHT,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: withAlpha(theme.colors.surface, theme.dark ? 0.96 : 1),
          borderTopWidth: 1,
          borderTopColor: withAlpha(theme.colors.outlineVariant, 0.6),
          elevation: Platform.OS === 'android' ? 12 : 0,
          shadowColor: '#000000',
          shadowOpacity: theme.dark ? 0.24 : 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarItemStyle: {
          marginHorizontal: 4,
          marginVertical: 4,
          borderRadius: 16,
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.15,
          marginTop: 2,
        },
        tabBarActiveTintColor: theme.colors.onSecondaryContainer,
        tabBarInactiveTintColor: withAlpha(theme.colors.onSurface, theme.dark ? 0.84 : 0.74),
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: labels.today,
          tabBarIcon: renderIcon('calendar-today'),
        }}
      />

      <Tab.Screen
        name="AllHabitsTab"
        component={AllHabitsScreen}
        options={{
          title: labels.allHabits,
          tabBarIcon: renderIcon('format-list-checkbox'),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: labels.settings,
          tabBarIcon: renderIcon('cog'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 68,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  activeIndicator: {
    position: 'absolute',
    width: 58,
    height: 32,
    borderRadius: 16,
  },
});
