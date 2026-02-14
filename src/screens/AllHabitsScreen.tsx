import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Text, List, useTheme } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';
import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';

import { useHabitsStore, WeekDay } from '../store/habits.store';
import { t } from '../i18n';

const weekDays: WeekDay[] = [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ];

export default function AllHabitsScreen({ navigation }: any) {
  const { habits, hydrated, hydrate } = useHabitsStore();
  const theme = useTheme();

  useEffect(() => {
    hydrate();
  }, [ hydrate ]);

  // Accordion state - all expanded by default
  const [ expandedDays, setExpandedDays ] = useState<Record<WeekDay, boolean>>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
  });

  // Group habits by day
  const habitsByDay = useMemo(() => {
    const grouped: Record<WeekDay, typeof habits> = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    habits.forEach((habit) => {
      habit.schedule.days.forEach((day) => {
        grouped[ day ].push(habit);
      });
    });

    return grouped;
  }, [ habits ]);

  // FAB shrink/expand
  const [ fabExpanded, setFabExpanded ] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <FancyHeaderLayout
        title={`${t('all_habits.title')} (${habits.length})`}
        isEmpty={habits.length === 0}
        onScrollY={(y) => {
          if (y > 60 && fabExpanded) setFabExpanded(false);
          if (y < 20 && !fabExpanded) setFabExpanded(true);
        }}
      >
        {!hydrated ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ textAlign: 'center', fontSize: 16, color: theme.colors.onSurfaceVariant }}>{t('common.loading')}</Text>
          </View>
        ) : habits.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 32 }}>
            <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 24, color: theme.colors.onSurfaceVariant }}>{t('all_habits.empty')}</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
            {weekDays.map((day) => {
              const dayHabits = habitsByDay[ day ];
              const count = dayHabits.length;

              if (count === 0) return null;

              return (
                <View
                  key={day}
                  style={{
                    marginBottom: 16,
                    borderRadius: 14,
                    backgroundColor: theme.colors.surface,
                    overflow: 'hidden',
                    elevation: 3,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    borderWidth: 1,
                    borderColor: theme.colors.primaryContainer,
                  }}
                >
                  <List.Accordion
                    title={t(`week.${day}`)}
                    description={`${count} ${count === 1 ? t('all_habits.habit') : t('all_habits.habits')}`}
                    expanded={expandedDays[ day ]}
                    onPress={() => setExpandedDays(prev => ({ ...prev, [ day ]: !prev[ day ] }))}
                    style={{
                      backgroundColor: theme.colors.surface,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                    }}
                    titleStyle={{
                      fontWeight: '700',
                      fontSize: 17,
                      color: theme.colors.primary,
                      letterSpacing: 0.3,
                    }}
                    descriptionStyle={{
                      fontSize: 13,
                      color: theme.colors.onSurfaceVariant,
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingBottom: 12,
                        paddingTop: 16,
                        backgroundColor: theme.colors.surface,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.primaryContainer,
                      }}
                    >
                      {dayHabits.map((h, index) => (
                        <View key={h.id} style={{ marginBottom: index < dayHabits.length - 1 ? 8 : 0 }}>
                          <HabitCard
                            habit={h}
                            canToggleToday={false}
                            onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                          />
                        </View>
                      ))}
                    </View>
                  </List.Accordion>
                </View>
              );
            })}
          </View>
        )}
      </FancyHeaderLayout>

      <View style={{ position: 'absolute', right: 16, bottom: 16 }}>
        <AnimatedFab
          expanded={fabExpanded}
          label={t('home.add_habit')}
          onPress={() => navigation.navigate('AddHabit')}
          icon="plus"
        />
      </View>
    </View>
  );
}


