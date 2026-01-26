import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button, Checkbox, List, Text, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useHabitsStore, WeekDay, HabitCategory } from '../store/habits.store';
import { useSettingsStore } from '../store/settings.store';

import { t } from '../i18n';
import { getCategoryColor } from '../utils/categoryColors';
import { pickRageMessage } from '../services/rageMessages';
import { ensureNotificationPermission, configureAndroidChannel } from '../services/notifications';
import { scheduleHabitNotifications } from '../services/habitNotifications';

import TimePickerField from '../ui/components/TimePickerField';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

export default function AddHabitScreen({ navigation, route }: Props) {
  const { habitId } = route.params || {};
  const { habits, addHabit, updateHabit } = useHabitsStore();
  const { locale, toneLevel, notificationsEnabled } = useSettingsStore();
  const theme = useTheme();

  const habitToEdit = useMemo(() =>
    habitId ? habits.find(h => h.id === habitId) : null,
    [ habitId, habits ]
  );

  const [ title, setTitle ] = useState('');
  const [ category, setCategory ] = useState<HabitCategory>('personal');
  const [ days, setDays ] = useState<WeekDay[]>([]);
  const [ time, setTime ] = useState('16:00');

  // Cargar datos del hábito si estamos editando
  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setCategory(habitToEdit.category);
      setDays(habitToEdit.schedule.days);
      setTime(habitToEdit.schedule.time);
    }
  }, [ habitToEdit ]);

  // Actualizar el título de la pantalla
  useEffect(() => {
    navigation.setOptions({
      title: habitId ? t('nav.edit_habit') : t('nav.new_habit')
    });
  }, [ habitId, navigation ]);

  const categoryOptions = useMemo<{ k: HabitCategory; l: string; icon: string }[]>(
    () => [
      { k: 'study', l: t('categories.study'), icon: 'book-open-variant' },
      { k: 'exercise', l: t('categories.exercise'), icon: 'dumbbell' },
      { k: 'health', l: t('categories.health'), icon: 'heart-pulse' },
      { k: 'work', l: t('categories.work'), icon: 'briefcase' },
      { k: 'personal', l: t('categories.personal'), icon: 'account' },
      { k: 'discipline', l: t('categories.discipline'), icon: 'shield-check' },
    ],
    []
  );

  const weekOptions = useMemo(
    () => [
      { k: 'mon' as const, l: t('week.mon') },
      { k: 'tue' as const, l: t('week.tue') },
      { k: 'wed' as const, l: t('week.wed') },
      { k: 'thu' as const, l: t('week.thu') },
      { k: 'fri' as const, l: t('week.fri') },
      { k: 'sat' as const, l: t('week.sat') },
      { k: 'sun' as const, l: t('week.sun') },
    ],
    []
  );

  const toggleDay = (d: WeekDay) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [ ...prev, d ]));
  };

  const canCreate = title.trim().length > 0 && days.length > 0;

  const onCreate = async () => {
    if (habitId) {
      // Modo edición
      await updateHabit(habitId, {
        title,
        category,
        schedule: { days, time },
      });

      // Reagendar notificaciones si están activas
      if (notificationsEnabled && habitToEdit) {
        const allowed = await ensureNotificationPermission();
        if (allowed) {
          await configureAndroidChannel();
          await scheduleHabitNotifications({
            habit: { ...habitToEdit, title, category, schedule: { days, time } },
            title: t('notifications.title'),
            body: pickRageMessage(locale, toneLevel),
          });
        }
      }

      navigation.goBack();
    } else {
      // Modo creación
      const created = await addHabit({
        title,
        category,
        schedule: { days, time },
      });

      // Si no se creó (validación), no hacemos nada
      if (!created) return;

      // Agenda notificaciones si están activas
      if (notificationsEnabled) {
        const allowed = await ensureNotificationPermission();
        if (allowed) {
          await configureAndroidChannel();

          await scheduleHabitNotifications({
            habit: created,
            title: t('notifications.title'),
            body: pickRageMessage(locale, toneLevel),
          });
        }
      }

      navigation.goBack();
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <TextInput
        label={t('add_habit.habit_name')}
        value={title}
        onChangeText={setTitle}
        mode="outlined"
      />

      <List.Section title={t('add_habit.category')} style={{ marginTop: 16, marginBottom: 0 }}>
        <View style={styles.categoryContainer}>
          {categoryOptions.map((cat) => {
            const isSelected = category === cat.k;
            return (
              <TouchableOpacity
                key={cat.k}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor: getCategoryColor(cat.k),
                    borderColor: isSelected ? '#000' : 'transparent',
                    opacity: isSelected ? 1 : 0.6,
                  }
                ]}
                onPress={() => setCategory(cat.k)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={28}
                  color={isSelected ? '#000' : '#555'}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    marginTop: 4,
                    color: isSelected ? '#000' : '#555',
                    fontWeight: isSelected ? '600' : '400',
                  }}
                >
                  {cat.l}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </List.Section>

      <List.Section title={t('add_habit.days')} style={{ marginTop: 0, marginBottom: 8 }}>
        <View style={styles.daysContainer}>
          {weekOptions.map((d) => {
            const isSelected = days.includes(d.k);
            return (
              <TouchableOpacity
                key={d.k}
                style={[
                  styles.dayItem,
                  {
                    backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                  }
                ]}
                onPress={() => toggleDay(d.k)}
                activeOpacity={0.7}
              >
                <Text
                  variant="labelLarge"
                  style={{
                    color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontWeight: isSelected ? '700' : '500',
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {d.l}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </List.Section>

      <List.Section>
        <TimePickerField
          label={t('add_habit.time')}
          value={time}
          onChange={setTime}
        />
      </List.Section>

      {!canCreate && (
        <Text style={{ marginBottom: 8, color: theme.colors.error, textAlign: 'center' }}>
          {t('add_habit.validation')}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.createButton,
          {
            backgroundColor: canCreate ? theme.colors.primary : theme.colors.surfaceDisabled,
          }
        ]}
        onPress={onCreate}
        disabled={!canCreate}
        activeOpacity={0.8}
      >
        <Text
          variant="titleMedium"
          style={{
            color: canCreate ? '#fff' : theme.colors.onSurfaceDisabled,
            fontWeight: '600',
          }}
        >
          {habitId ? t('add_habit.update') : t('add_habit.create')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1.1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dayItem: {
    flexGrow: 1,
    flexBasis: '22%',
    maxWidth: '31%',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
});
