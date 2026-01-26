import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabsNavigator from './TabsNavigator';
import AddHabitScreen from '../screens/AddHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import UrgentMotivationScreen from '../screens/UrgentMotivationScreen';
import AddMotivationItemScreen from '../screens/AddMotivationItemScreen';
import { t } from '../i18n';

export type RootStackParamList = {
  Tabs: undefined;
  AddHabit: { habitId?: string };
  HabitDetail: { habitId: string };
  UrgentMotivation: undefined;
  AddMotivationItem: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />

      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{ title: t('nav.new_habit') }}
      />

      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{ title: 'Habit' }}
      />

      <Stack.Screen
        name="UrgentMotivation"
        component={UrgentMotivationScreen}
        options={{ title: t('motivation.title'), presentation: 'modal' }}
      />

      <Stack.Screen
        name="AddMotivationItem"
        component={AddMotivationItemScreen}
        options={{ title: t('motivation.add'), presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}