import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, List, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

import { RootStackParamList } from '../navigation/RootNavigator';
import { HabitCategory, useHabitsStore, WeekDay } from '../store/habits.store';
import { useSettingsStore } from '../store/settings.store';

import { t } from '../i18n';
import { getCategoryColor } from '../utils/categoryColors';
import { pickRageMessage } from '../services/rageMessages';
import { configureAndroidChannel, ensureNotificationPermission } from '../services/notifications';
import { scheduleHabitNotifications } from '../services/habitNotifications';

import TimePickerField from '../ui/components/TimePickerField';
import FancyHeaderBackLayout from '../ui/layouts/FancyHeaderBackLayout';
import { AppTheme } from '../ui/theme';
import { withAlpha } from '../ui/glass';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

export default function AddHabitScreen({ navigation, route }: Props) {
  const { habitId } = route.params || {};
  const { habits, addHabit, updateHabit } = useHabitsStore();
  const { locale, toneLevel, notificationsEnabled } = useSettingsStore();
  const theme = useTheme() as AppTheme;

  const habitToEdit = useMemo(
    () => (habitId ? habits.find((h) => h.id === habitId) : null),
    [ habitId, habits ]
  );

  const [ title, setTitle ] = useState('');
  const [ category, setCategory ] = useState<HabitCategory>('personal');
  const [ days, setDays ] = useState<WeekDay[]>([]);
  const [ time, setTime ] = useState('16:00');

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setCategory(habitToEdit.category);
      setDays(habitToEdit.schedule.days);
      setTime(habitToEdit.schedule.time);
    }
  }, [ habitToEdit ]);

  useEffect(() => {
    navigation.setOptions({
      title: habitId ? t('nav.edit_habit') : t('nav.new_habit'),
    });
  }, [ habitId, navigation, locale ]);

  const categoryOptions = useMemo<{ k: HabitCategory; l: string; icon: string }[]>(
    () => [
      { k: 'study', l: t('categories.study'), icon: 'book-open-variant' },
      { k: 'exercise', l: t('categories.exercise'), icon: 'dumbbell' },
      { k: 'health', l: t('categories.health'), icon: 'heart-pulse' },
      { k: 'work', l: t('categories.work'), icon: 'briefcase' },
      { k: 'personal', l: t('categories.personal'), icon: 'account' },
      { k: 'discipline', l: t('categories.discipline'), icon: 'shield-check' },
    ],
    [ locale ]
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
    [ locale ]
  );

  const toggleDay = (d: WeekDay) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [ ...prev, d ]));
  };

  const canCreate = title.trim().length > 0 && days.length > 0;

  const onCreate = async () => {
    if (habitId) {
      await updateHabit(habitId, {
        title,
        category,
        schedule: { days, time },
      });

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
      return;
    }

    const created = await addHabit({
      title,
      category,
      schedule: { days, time },
    });

    if (!created) return;

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
    <View style={{ flex: 1 }}>
      <FancyHeaderBackLayout
        title={habitId ? t('nav.edit_habit') : t('nav.new_habit')}
        onBack={() => navigation.goBack()}
      >
        <TextInput
          label={t('add_habit.habit_name')}
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={[ styles.nameInput, { backgroundColor: theme.colors.surface } ]}
          outlineStyle={styles.nameInputOutline}
          outlineColor={withAlpha(theme.colors.outline, 0.72)}
          activeOutlineColor={theme.colors.primary}
          contentStyle={styles.nameInputContent}
          left={<TextInput.Icon icon="format-title" />}
          returnKeyType="done"
        />

        <List.Section title={t('add_habit.category')} style={{ marginTop: 2, marginBottom: 0 }}>
          <View style={styles.categoryContainer}>
            {categoryOptions.map((cat) => {
              const isSelected = category === cat.k;
              const categoryColor = getCategoryColor(cat.k, theme);

              return (
                <TouchableRipple
                  key={cat.k}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected
                        ? withAlpha(categoryColor, theme.dark ? 0.28 : 0.18)
                        : theme.colors.elevation.level1,
                      borderColor: isSelected
                        ? withAlpha(categoryColor, theme.dark ? 0.9 : 0.72)
                        : withAlpha(theme.colors.outlineVariant, 0.78),
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setCategory(cat.k)}
                  borderless={false}
                >
                  <View style={styles.categoryInner}>
                    <View
                      style={[
                        styles.categoryAccent,
                        {
                          backgroundColor: withAlpha(categoryColor, isSelected ? 0.92 : 0),
                        },
                      ]}
                    />

                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={29}
                      color={isSelected ? categoryColor : theme.colors.onSurfaceVariant}
                    />

                    <Text
                      variant="labelSmall"
                      style={{
                        marginTop: 6,
                        color: isSelected ? categoryColor : theme.colors.onSurfaceVariant,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {cat.l}
                    </Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        </List.Section>

        <List.Section title={t('add_habit.days')} style={{ marginTop: 0, marginBottom: 8 }}>
          <View style={styles.daysContainer}>
            {weekOptions.map((d) => {
              const isSelected = days.includes(d.k);
              return (
                <TouchableRipple
                  key={d.k}
                  style={[
                    styles.dayItem,
                    {
                      backgroundColor: isSelected
                        ? withAlpha(theme.colors.primaryContainer, theme.dark ? 0.86 : 0.92)
                        : theme.colors.elevation.level1,
                      borderColor: isSelected
                        ? withAlpha(theme.colors.primary, theme.dark ? 0.6 : 0.48)
                        : withAlpha(theme.colors.outlineVariant, 0.76),
                    },
                  ]}
                  onPress={() => toggleDay(d.k)}
                  borderless={false}
                >
                  <View style={styles.dayInner}>
                    <Text
                      variant="labelLarge"
                      style={{
                        color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
                        fontWeight: isSelected ? '700' : '600',
                        textAlign: 'center',
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {d.l}
                    </Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>
        </List.Section>

        <List.Section>
          <TimePickerField label={t('add_habit.time')} value={time} onChange={setTime} />
        </List.Section>

        {!canCreate && (
          <Text style={{ marginBottom: 10, color: theme.colors.error, textAlign: 'center' }}>
            {t('add_habit.validation')}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={onCreate}
          disabled={!canCreate}
          style={styles.createButton}
          contentStyle={styles.createButtonContent}
          labelStyle={styles.createButtonLabel}
        >
          {habitId ? t('add_habit.update') : t('add_habit.create')}
        </Button>
      </FancyHeaderBackLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  nameInput: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  nameInputOutline: {
    borderRadius: 12,
  },
  nameInputContent: {
    minHeight: 54,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  categoryItem: {
    width: '31%',
    aspectRatio: 1.05,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoryAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  dayItem: {
    flexGrow: 1,
    flexBasis: '22%',
    maxWidth: '31%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayInner: {
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  createButton: {
    marginTop: 14,
    marginBottom: 18,
    borderRadius: 12,
  },
  createButtonContent: {
    minHeight: 52,
  },
  createButtonLabel: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});