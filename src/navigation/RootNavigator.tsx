import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabsNavigator from './TabsNavigator';
import AddHabitScreen from '../screens/AddHabitScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import { t } from '../i18n';

export type RootStackParamList = {
  Tabs: undefined;
  AddHabit: undefined;
  HabitDetail: { habitId: string };
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
    </Stack.Navigator>
  );
}
