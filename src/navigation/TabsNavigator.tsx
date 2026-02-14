import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import AllHabitsScreen from '../screens/AllHabitsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { t } from '../i18n';
import { useTheme } from 'react-native-paper';
import { useSettingsStore } from '../store/settings.store';

export type TabsParamList = {
  HomeTab: undefined;
  AllHabitsTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

export default function TabsNavigator() {
  const locale = useSettingsStore((s) => s.locale);
  const theme = useTheme();
  const labels = React.useMemo(
    () => ({
      today: t('nav.today'),
      allHabits: t('nav.all_habits'),
      settings: t('nav.settings'),
    }),
    [ locale ]
  );

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarStyle: { height: 68, paddingTop: 6, paddingBottom: 10 }, tabBarActiveTintColor: theme.colors.primary, tabBarInactiveTintColor: theme.colors.onSurfaceVariant, }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: labels.today,
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AllHabitsTab"
        component={AllHabitsScreen}
        options={{
          title: labels.allHabits,
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="format-list-checkbox" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: labels.settings,
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
