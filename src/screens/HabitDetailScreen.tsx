import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Chip, Divider, useTheme, IconButton, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/RootNavigator';
import { useHabitsStore } from '../store/habits.store';
import { getCategoryColor } from '../utils/categoryColors';
import { formatScheduleLabel } from '../utils/schedule';
import { todayKey as makeTodayKey } from '../utils/date';
import { t } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export default function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const { habits, removeHabit, toggleToday } = useHabitsStore();
  const theme = useTheme();
  const [ currentMonth, setCurrentMonth ] = useState(new Date());

  const habit = useMemo(() => habits.find(h => h.id === habitId), [ habits, habitId ]);

  useEffect(() => {
    if (habit) {
      navigation.setOptions({ title: habit.title });
    }
  }, [ habit, navigation ]);

  if (!habit) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text variant="bodyLarge">{t('habit_detail.not_found')}</Text>
      </View>
    );
  }

  const categoryColor = getCategoryColor(habit.category);
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
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
                  iconColor="#555"
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
              iconColor="#D32F2F"
            />
          </View>

          {/* Today's completion toggle */}
          <Divider style={{ marginVertical: 16 }} />
          <View style={styles.todayToggleContainer}>
            <Button
              mode="contained"
              onPress={handleToggleToday}
              style={{ borderRadius: 20 }}
              buttonColor={isCompletedToday ? '#D32F2F' : theme.colors.primary}
              textColor="#fff"
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
            {[ 'D', 'L', 'M', 'M', 'J', 'V', 'S' ].map((day, i) => (
              <View key={i} style={styles.dayHeader}>
                <Text variant="labelSmall" style={{ fontWeight: '600', opacity: 0.6 }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          {renderCalendar(currentMonth, habit.completions, theme, categoryColor)}
        </Card.Content>
      </Card>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons
              name="fire"
              size={32}
              color="#FF6B6B"
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
              color="#4CAF50"
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


    </ScrollView>
  );
}

function renderCalendar(currentMonth: Date, completions: Record<string, boolean>, theme: any, categoryColor: string) {
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
    const dateKey = date.toISOString().split('T')[ 0 ];
    const isCompleted = completions[ dateKey ];

    currentWeek.push({
      day,
      isCompleted,
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
            <View
              key={dayIndex}
              style={[
                styles.dayCell,
                dayInfo?.isCompleted && {
                  backgroundColor: categoryColor,
                  borderRadius: 100,
                }
              ]}
            >
              {dayInfo && (
                <Text
                  variant="bodyMedium"
                  style={{
                    fontWeight: dayInfo.isCompleted ? '700' : '400',
                    color: dayInfo.isCompleted ? '#000' : theme.colors.onSurface,
                  }}
                >
                  {dayInfo.day}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
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


