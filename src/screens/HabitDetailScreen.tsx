import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Chip, Divider, useTheme, IconButton, Button } from 'react-native-paper';
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

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const { habits, removeHabit, toggleToday, toggleCompletionForDate } = useHabitsStore();
  const locale = useSettingsStore((s) => s.locale);
  const theme = useTheme();
  const [ currentMonth, setCurrentMonth ] = useState(new Date());

  const habit = useMemo(() => habits.find(h => h.id === habitId), [ habits, habitId ]);

  if (!habit) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="bodyLarge">{t('habit_detail.not_found')}</Text>
      </View>
    );
  }

  const categoryColor = getCategoryColor(habit.category, theme as any);
  const scheduleLabel = formatScheduleLabel(habit.schedule.days, habit.schedule.time);

  // Check if completed today
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
      // Show confirmation when marking as incomplete
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
    } else {
      // Mark as complete without confirmation
      toggleToday(habitId);
    }
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

  // Calculate statistics
  const completionDates = Object.entries(habit.completions)
    .filter(([ _, completed ]) => completed)
    .map(([ date ]) => date)
    .sort()
    .reverse();

  const totalCompletions = completionDates.length;

  // Calculate current streak
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
      {/* Header Card */}
      <Card style={{ marginBottom: 16, backgroundColor: categoryColor }}>
        <Card.Content>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons
              name="trophy"
              size={48}
              color={theme.colors.primary}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text variant="headlineSmall" style={{ fontWeight: '600' }}>
                  {habit.title}
                </Text>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={handleEdit}
                  iconColor={theme.dark ? '#CCC' : '#555'}
                  style={{ margin: 0 }}
                />
              </View>
              <Chip
                mode="outlined"
                style={{ alignSelf: 'flex-start', marginTop: 8 }}
              >
                {t(`categories.${habit.category}`)}
              </Chip>
            </View>
            <IconButton
              icon="delete"
              size={24}
              onPress={handleDelete}
              iconColor={theme.colors.error}
            />
          </View>

          {/* Today's completion toggle */}
          <Divider style={{ marginVertical: 16 }} />
          <View style={styles.todayToggleContainer}>
            <Button
              mode="contained"
              onPress={handleToggleToday}
              style={{ borderRadius: 20 }}
              buttonColor={isCompletedToday ? theme.colors.error : theme.colors.primary}
              textColor={isCompletedToday ? theme.colors.onError : theme.colors.onPrimary}
            >
              {isCompletedToday ? t('habit_detail.mark_incomplete') : t('habit_detail.mark_complete')}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Calendar View */}
      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(currentMonth.getMonth() - 1);
                setCurrentMonth(newMonth);
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.primary} />
            </TouchableOpacity>

            <Text variant="titleMedium" style={{ fontWeight: '600' }}>
              {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>

            <TouchableOpacity
              onPress={() => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(currentMonth.getMonth() + 1);
                setCurrentMonth(newMonth);
              }}
            >
              <MaterialCommunityIcons name="chevron-right" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
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
                <Text variant="labelSmall" style={{ fontWeight: '600', opacity: 0.6 }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          {renderCalendar(
            currentMonth,
            habit.completions,
            habit.schedule.days,
            theme,
            categoryColor,
            handleToggleCalendarDay
          )}
        </Card.Content>
      </Card>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="fire"
              size={32}
              color={theme.colors.primary}
            />
            <Text variant="displaySmall" style={{ fontWeight: '700', marginTop: 8 }}>
              {currentStreak}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              {t('habit_detail.current_streak')}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color={theme.colors.success}
            />
            <Text variant="displaySmall" style={{ fontWeight: '700', marginTop: 8 }}>
              {totalCompletions}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              {t('habit_detail.total_completions')}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Schedule Info */}
      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 12 }}>
            {t('habit_detail.schedule')}
          </Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={{ marginLeft: 12 }}>
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
  theme: any,
  categoryColor: string,
  onDayPress: (dateKey: string, isCompleted: boolean) => void
) {
  const weekdayMap: WeekDay[] = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const weeks = [];
  let currentWeek = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Add all days of the month
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

    // If week is complete (7 days), start a new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill remaining cells in last week
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
              activeOpacity={0.8}
              disabled={!dayInfo || !!dayInfo.isFuture}
              onPress={() => dayInfo && onDayPress(dayInfo.dateKey, !!dayInfo.isCompleted)}
              style={[
                styles.dayCell,
                dayInfo?.isScheduled && !dayInfo?.isCompleted && {
                  borderWidth: 1.5,
                  borderColor: darkenColor(categoryColor, 0.15),
                  borderRadius: 100,
                },
                dayInfo?.isCompleted && {
                  backgroundColor: categoryColor,
                  borderWidth: 1.5,
                  borderColor: categoryColor,
                  borderRadius: 100,
                }
              ]}
            >
              {dayInfo && (
                <Text
                  variant="bodyMedium"
                  style={{
                    fontWeight: dayInfo.isCompleted ? '700' : '400',
                    color: dayInfo.isCompleted ? theme.colors.onSurface : theme.colors.onSurface,
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
    paddingVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
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









