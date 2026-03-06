import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useHabitsStore, WeekDay } from '../store/habits.store';
import { useSettingsStore } from '../store/settings.store';
import { getCategoryColor } from '../utils/categoryColors';
import { formatScheduleLabel } from '../utils/schedule';
import { todayKey as makeTodayKey } from '../utils/date';
import { t } from '../i18n';
import FancyHeaderBackLayout from '../ui/layouts/FancyHeaderBackLayout';
import { AppTheme } from '../ui/theme';
import { glassPanel, withAlpha } from '../ui/glass';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const { habits, removeHabit, toggleToday, toggleCompletionForDate } = useHabitsStore();
  const locale = useSettingsStore((s) => s.locale);
  const theme = useTheme() as AppTheme;
  const [ currentMonth, setCurrentMonth ] = useState(new Date());

  const habit = useMemo(() => habits.find((h) => h.id === habitId), [ habits, habitId ]);

  if (!habit) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ ...glassPanel(theme, 'soft'), padding: 20 }}>
          <Text variant="bodyLarge">{t('habit_detail.not_found')}</Text>
        </View>
      </View>
    );
  }

  const categoryColor = getCategoryColor(habit.category, theme);
  const scheduleLabel = formatScheduleLabel(habit.schedule.days, habit.schedule.time);

  const isCompletedToday = useMemo(() => {
    const todayKey = makeTodayKey();
    return habit.completions[ todayKey ] === true;
  }, [ habit.completions ]);

  const handleDelete = () => {
    Alert.alert(
      t('habit_detail.delete_title'),
      t('habit_detail.delete_message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('habit_detail.delete_confirm'),
          style: 'destructive',
          onPress: async () => {
            await removeHabit(habitId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddHabit', { habitId: habit.id });
  };

  const handleToggleToday = () => {
    if (isCompletedToday) {
      Alert.alert(
        t('habit_detail.mark_incomplete_confirm_title'),
        t('habit_detail.mark_incomplete_confirm_message'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('habit_detail.mark_incomplete_confirm_button'),
            style: 'destructive',
            onPress: () => toggleToday(habitId),
          },
        ]
      );
      return;
    }

    toggleToday(habitId);
  };

  const handleToggleCalendarDay = (dateKey: string, isCompleted: boolean) => {
    const date = new Date(`${dateKey}T00:00:00`);
    const localeTag = locale === 'es' ? 'es-ES' : locale === 'ar' ? 'ar' : 'en-US';
    const dateLabel = date.toLocaleDateString(localeTag, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const messageTemplate = isCompleted
      ? t('habit_detail.confirm_mark_incomplete_message')
      : t('habit_detail.confirm_mark_complete_message');

    const message = String(messageTemplate)
      .replace('{date}', dateLabel)
      .replace('%{date}', dateLabel);

    Alert.alert(
      t('habit_detail.confirm_toggle_title'),
      message,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: isCompleted ? t('habit_detail.mark_incomplete') : t('habit_detail.mark_complete'),
          style: isCompleted ? 'destructive' : 'default',
          onPress: () => toggleCompletionForDate(habitId, dateKey),
        },
      ]
    );
  };

  const completionDates = Object.entries(habit.completions)
    .filter(([ _, completed ]) => completed)
    .map(([ date ]) => date)
    .sort()
    .reverse();

  const totalCompletions = completionDates.length;

  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 100; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[ 0 ];

    if (habit.completions[ dateKey ]) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <FancyHeaderBackLayout title={habit.title} onBack={() => navigation.goBack()}>
      <Card
        style={{
          ...glassPanel(theme, 'medium'),
          marginBottom: 14,
          backgroundColor: withAlpha(categoryColor, theme.dark ? 0.36 : 0.64),
        }}
      >
        <Card.Content>
          <View style={styles.headerContent}>
            <View
              style={{
                ...glassPanel(theme, 'soft'),
                width: 56,
                height: 56,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.elevation.level2,
              }}
            >
              <MaterialCommunityIcons name="trophy" size={30} color={theme.colors.primary} />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="headlineSmall" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                  {habit.title}
                </Text>
                <IconButton
                  icon="pencil"
                  size={18}
                  onPress={handleEdit}
                  iconColor={theme.colors.primary}
                  style={{ margin: 0 }}
                />
              </View>

              <Chip
                mode="flat"
                style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: withAlpha(theme.colors.primary, 0.16) }}
                textStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
              >
                {t(`categories.${habit.category}`)}
              </Chip>
            </View>

            <IconButton icon="delete" size={22} onPress={handleDelete} iconColor={theme.colors.error} />
          </View>

          <Divider style={{ marginVertical: 16, backgroundColor: withAlpha(theme.colors.outlineVariant, 0.72) }} />

          <View style={styles.todayToggleContainer}>
            <Button
              mode="contained"
              onPress={handleToggleToday}
              style={{ borderRadius: 14 }}
              buttonColor={isCompletedToday ? theme.colors.error : theme.colors.primary}
              textColor={isCompletedToday ? theme.colors.onError : theme.colors.onPrimary}
            >
              {isCompletedToday ? t('habit_detail.mark_incomplete') : t('habit_detail.mark_complete')}
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card
        style={{
          ...glassPanel(theme, 'medium'),
          marginBottom: 14,
          backgroundColor: theme.colors.elevation.level2,
        }}
      >
        <Card.Content>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(currentMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={30} color={theme.colors.primary} />
            </TouchableOpacity>

            <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
              {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>

            <TouchableOpacity
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(currentMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
            >
              <MaterialCommunityIcons name="chevron-right" size={30} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysContainer}>
            {[
              t('week_short.sun'),
              t('week_short.mon'),
              t('week_short.tue'),
              t('week_short.wed'),
              t('week_short.thu'),
              t('week_short.fri'),
              t('week_short.sat'),
            ].map((day, i) => (
              <View key={i} style={styles.dayHeader}>
                <Text variant="labelSmall" style={{ fontWeight: '700', opacity: 0.72, color: theme.colors.onSurfaceVariant }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {renderCalendar(currentMonth, habit.completions, habit.schedule.days, theme, categoryColor, handleToggleCalendarDay)}
        </Card.Content>
      </Card>

      <View style={styles.statsContainer}>
        <Card
          style={{
            ...styles.statCard,
            ...glassPanel(theme, 'soft'),
            backgroundColor: theme.colors.elevation.level2,
          }}
        >
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="fire" size={30} color={theme.colors.primary} />
            <Text variant="displaySmall" style={{ fontWeight: '800', marginTop: 8, color: theme.colors.onSurface }}>
              {currentStreak}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.74, color: theme.colors.onSurfaceVariant }}>
              {t('habit_detail.current_streak')}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={{
            ...styles.statCard,
            ...glassPanel(theme, 'soft'),
            backgroundColor: theme.colors.elevation.level2,
          }}
        >
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="check-circle" size={30} color={theme.colors.success} />
            <Text variant="displaySmall" style={{ fontWeight: '800', marginTop: 8, color: theme.colors.onSurface }}>
              {totalCompletions}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.74, color: theme.colors.onSurfaceVariant }}>
              {t('habit_detail.total_completions')}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card
        style={{
          ...glassPanel(theme, 'soft'),
          marginBottom: 14,
          backgroundColor: theme.colors.elevation.level2,
        }}
      >
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: 10, color: theme.colors.onSurface }}>
            {t('habit_detail.schedule')}
          </Text>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ marginLeft: 10, color: theme.colors.onSurfaceVariant }}>
              {scheduleLabel}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </FancyHeaderBackLayout>
  );
}

function renderCalendar(
  currentMonth: Date,
  completions: Record<string, boolean>,
  scheduledDays: WeekDay[],
  theme: AppTheme,
  categoryColor: string,
  onDayPress: (dateKey: string, isCompleted: boolean) => void
) {
  const weekdayMap: WeekDay[] = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[ 0 ];
    const isCompleted = completions[ dateKey ];
    const weekday = weekdayMap[ date.getDay() ];
    const isScheduled = scheduledDays.includes(weekday);
    const isFuture = date.getTime() > today.getTime();

    currentWeek.push({
      day,
      isCompleted,
      isScheduled,
      isFuture,
      dateKey,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <View style={styles.calendarGrid}>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((dayInfo, dayIndex) => (
            <TouchableOpacity
              key={dayIndex}
              activeOpacity={0.84}
              disabled={!dayInfo || !!dayInfo.isFuture}
              onPress={() => dayInfo && onDayPress(dayInfo.dateKey, !!dayInfo.isCompleted)}
              style={[
                styles.dayCell,
                dayInfo?.isScheduled && !dayInfo?.isCompleted && {
                  borderWidth: 1.4,
                  borderColor: darkenColor(categoryColor, 0.2),
                  borderRadius: 999,
                },
                dayInfo?.isCompleted && {
                  backgroundColor: categoryColor,
                  borderWidth: 1.4,
                  borderColor: categoryColor,
                  borderRadius: 999,
                },
              ]}
            >
              {dayInfo && (
                <Text
                  variant="bodyMedium"
                  style={{
                    fontWeight: dayInfo.isCompleted ? '800' : '500',
                    color: dayInfo.isCompleted ? theme.colors.onSurface : theme.colors.onSurface,
                    opacity: dayInfo.isFuture ? 0.42 : 1,
                  }}
                >
                  {dayInfo.day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

function darkenColor(color: string, amount: number) {
  const factor = 1 - Math.max(0, Math.min(1, amount));

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    const r = Math.round(parseInt(color.slice(1, 3), 16) * factor);
    const g = Math.round(parseInt(color.slice(3, 5), 16) * factor);
    const b = Math.round(parseInt(color.slice(5, 7), 16) * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const expanded = `#${color[ 1 ]}${color[ 1 ]}${color[ 2 ]}${color[ 2 ]}${color[ 3 ]}${color[ 3 ]}`;
    return darkenColor(expanded, amount);
  }

  return color;
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayToggleContainer: {
    paddingVertical: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
  },
  calendarGrid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
