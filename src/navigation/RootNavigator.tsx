import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabsNavigator from './TabsNavigator';
import AddHabitScreen from '../screens/AddHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import UrgentMotivationScreen from '../screens/UrgentMotivationScreen';
import AddMotivationItemScreen from '../screens/AddMotivationItemScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';

export type RootStackParamList = {
  Welcome: undefined;
  Tabs: undefined;
  AddHabit: { habitId?: string };
  HabitDetail: { habitId: string };
  UrgentMotivation: undefined;
  AddMotivationItem: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const hasSeenWelcome = useSettingsStore((s) => s.hasSeenWelcome);
  const locale = useSettingsStore((s) => s.locale);
  const habitDetailTitle = React.useMemo(() => t('nav.habit_detail'), [ locale ]);

  return (
    <Stack.Navigator initialRouteName={hasSeenWelcome ? 'Tabs' : 'Welcome'}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />

      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{ headerShown: false, title: habitDetailTitle }}
      />

      <Stack.Screen
        name="UrgentMotivation"
        component={UrgentMotivationScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />

      <Stack.Screen
        name="AddMotivationItem"
        component={AddMotivationItemScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
