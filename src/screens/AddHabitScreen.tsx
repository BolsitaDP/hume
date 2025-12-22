import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Checkbox, List, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useHabitsStore, WeekDay } from '../store/habits.store';
import { useSettingsStore } from '../store/settings.store';

import { t } from '../i18n';
import { pickRageMessage } from '../services/rageMessages';
import { ensureNotificationPermission, configureAndroidChannel } from '../services/notifications';
import { scheduleHabitNotifications } from '../services/habitNotifications';

import TimePickerField from '../ui/components/TimePickerField';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

export default function AddHabitScreen({ navigation }: Props) {
  const addHabit = useHabitsStore((s) => s.addHabit);
  const { locale, toneLevel, notificationsEnabled } = useSettingsStore();

  const [ title, setTitle ] = useState('');
  const [ days, setDays ] = useState<WeekDay[]>([]);
  const [ time, setTime ] = useState('16:00');

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
    const created = await addHabit({
      title,
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
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        label={t('add_habit.habit_name')}
        value={title}
        onChangeText={setTitle}
        mode="outlined"
      />

      <List.Section title={t('add_habit.days')}>
        {weekOptions.map((d) => (
          <Checkbox.Item
            key={d.k}
            label={d.l}
            status={days.includes(d.k) ? 'checked' : 'unchecked'}
            onPress={() => toggleDay(d.k)}
          />
        ))}
      </List.Section>

      <List.Section>
        <TimePickerField
          label={t('add_habit.time')}
          value={time}
          onChange={setTime}
        />
      </List.Section>

      {!canCreate && (
        <Text style={{ marginBottom: 8 }}>
          {t('add_habit.validation')}
        </Text>
      )}

      <Button mode="contained" onPress={onCreate} disabled={!canCreate}>
        {t('add_habit.create')}
      </Button>
    </View>
  );
}
