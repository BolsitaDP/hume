import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Text, List, useTheme } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';

import { useHabitsStore, WeekDay } from '../store/habits.store';
import { t } from '../i18n';

const weekDays: WeekDay[] = [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ];

export default function AllHabitsScreen({ navigation }: any) {
  const { habits, hydrated, hydrate, toggleToday, removeHabit } = useHabitsStore();
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
  const scrollY = useRef(new Animated.Value(0)).current;
  const [ fabExpanded, setFabExpanded ] = useState(true);

  const onScroll = useMemo(
    () =>
      Animated.event([ { nativeEvent: { contentOffset: { y: scrollY } } } ], {
        useNativeDriver: true,
        listener: (e: any) => {
          const y = e?.nativeEvent?.contentOffset?.y ?? 0;
          if (y > 60 && fabExpanded) setFabExpanded(false);
          if (y < 20 && !fabExpanded) setFabExpanded(true);
        },
      }),
    [ fabExpanded, scrollY ]
  );

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
          flexGrow: 1,
          justifyContent: habits.length === 0 ? 'center' : 'flex-start'
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {!hydrated ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ textAlign: 'center', fontSize: 16 }}>{t('common.loading')}</Text>
          </View>
        ) : habits.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 32 }}>
            <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 24 }}>{t('all_habits.empty')}</Text>
          </View>
        ) : (
          <>
            <Text variant="titleLarge" style={{ marginBottom: 16, fontWeight: '600' }}>
              {t('all_habits.title')} ({habits.length})
            </Text>

            {weekDays.map((day) => {
              const dayHabits = habitsByDay[ day ];
              const count = dayHabits.length;

              if (count === 0) return null;

              return (
                <View
                  key={day}
                  style={{
                    marginBottom: 12,
                    borderRadius: 12,
                    backgroundColor: theme.colors.surfaceVariant,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                >
                  <List.Accordion
                    title={t(`week.${day}`)}
                    description={`${count} ${count === 1 ? t('all_habits.habit') : t('all_habits.habits')}`}
                    expanded={expandedDays[ day ]}
                    onPress={() => setExpandedDays(prev => ({ ...prev, [ day ]: !prev[ day ] }))}
                    style={{
                      backgroundColor: theme.colors.surface,
                      paddingVertical: 4,
                    }}
                    titleStyle={{
                      fontWeight: '600',
                      fontSize: 16,
                    }}
                    descriptionStyle={{
                      fontSize: 13,
                      opacity: 0.7,
                    }}
                  >
                    <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                      {dayHabits.map((h) => (
                        <HabitCard
                          key={h.id}
                          habit={h}
                          onToggleToday={() => toggleToday(h.id)}
                          onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                        />
                      ))}
                    </View>
                  </List.Accordion>
                </View>
              );
            })}
          </>
        )}
      </Animated.ScrollView>

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
