import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
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

type IconPillProps = {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size: number;
  color: string;
  focused: boolean;
  theme: AppTheme;
};

function IconPill({ iconName, size, color, focused, theme }: IconPillProps) {
  return (
    <View
      style={[
        styles.iconPill,
        focused
          ? {
            backgroundColor: withAlpha(theme.colors.primary, theme.dark ? 0.2 : 0.12),
            borderColor: withAlpha(theme.colors.primary, theme.dark ? 0.42 : 0.32),
          }
          : {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
      ]}
    >
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
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

  const renderIcon = (iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name']) =>
    ({ size, color, focused }: IconRendererProps) => (
      <IconPill iconName={iconName} size={size} color={color} focused={focused} theme={theme} />
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
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: withAlpha(theme.colors.outlineVariant, 0.75),
          elevation: Platform.OS === 'android' ? 12 : 0,
          shadowColor: '#000000',
          shadowOpacity: theme.dark ? 0.28 : 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarItemStyle: {
          marginHorizontal: 6,
          marginVertical: 4,
          borderRadius: 16,
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 1,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
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
          tabBarIcon: renderIcon('cog-outline'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 44,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});