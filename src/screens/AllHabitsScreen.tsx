import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';
import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';

import { useHabitsStore, WeekDay } from '../store/habits.store';
import { t } from '../i18n';
import { AppTheme } from '../ui/theme';
import { glassPanel, withAlpha } from '../ui/glass';

const weekDays: WeekDay[] = [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ];

export default function AllHabitsScreen({ navigation }: any) {
  const { habits, hydrated, hydrate } = useHabitsStore();
  const theme = useTheme() as AppTheme;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    hydrate();
  }, [ hydrate ]);

  const [ expandedDays, setExpandedDays ] = useState<Record<WeekDay, boolean>>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
  });

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

  const [ fabExpanded, setFabExpanded ] = useState(true);
  const baseFabBottom = Math.max(16, insets.bottom + 8);

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
          <View
            style={{
              ...glassPanel(theme, 'soft'),
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              paddingVertical: 28,
              backgroundColor: theme.colors.elevation.level2,
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, color: theme.colors.onSurfaceVariant }}>{t('common.loading')}</Text>
          </View>
        ) : habits.length === 0 ? (
          <View
            style={{
              ...glassPanel(theme, 'soft'),
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              paddingHorizontal: 32,
              paddingVertical: 28,
              backgroundColor: theme.colors.elevation.level2,
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, color: theme.colors.onSurfaceVariant }}>{t('all_habits.empty')}</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 4, paddingVertical: 8 }}>
            {weekDays.map((day) => {
              const dayHabits = habitsByDay[ day ];
              const count = dayHabits.length;
              const expanded = expandedDays[ day ];

              if (count === 0) return null;

              return (
                <View
                  key={day}
                  style={[
                    styles.accordionCard,
                    {
                      ...glassPanel(theme, expanded ? 'medium' : 'soft'),
                      backgroundColor: expanded ? theme.colors.elevation.level3 : theme.colors.elevation.level2,
                      borderColor: withAlpha(theme.colors.outlineVariant, expanded ? 0.84 : 0.72),
                    },
                  ]}
                >
                  <TouchableRipple
                    borderless
                    onPress={() => setExpandedDays((prev) => ({ ...prev, [ day ]: !prev[ day ] }))}
                    style={styles.accordionHeader}
                  >
                    <View style={styles.accordionHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
                          {t(`week.${day}`)}
                        </Text>

                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                        >
                          {`${count} ${count === 1 ? t('all_habits.habit') : t('all_habits.habits')}`}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.countPill,
                          {
                            backgroundColor: withAlpha(theme.colors.primaryContainer, theme.dark ? 0.72 : 0.8),
                            borderColor: withAlpha(theme.colors.primary, theme.dark ? 0.44 : 0.28),
                          },
                        ]}
                      >
                        <Text
                          variant="labelMedium"
                          style={{ color: theme.colors.primary, fontWeight: '700' }}
                        >
                          {count}
                        </Text>
                      </View>

                      <MaterialCommunityIcons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={theme.colors.primary}
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </TouchableRipple>

                  {expanded && (
                    <>
                      <Divider
                        style={{
                          marginHorizontal: 14,
                          backgroundColor: withAlpha(theme.colors.outlineVariant, theme.dark ? 0.66 : 0.5),
                        }}
                      />

                      <View style={styles.accordionBody}>
                        {dayHabits.map((h) => (
                          <HabitCard
                            key={h.id}
                            habit={h}
                            canToggleToday={false}
                            onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                          />
                        ))}
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </FancyHeaderLayout>

      <View style={{ position: 'absolute', right: 20, bottom: baseFabBottom }}>
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

const styles = StyleSheet.create({
  accordionCard: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accordionHeader: {
    borderRadius: 16,
  },
  accordionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countPill: {
    minWidth: 30,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  accordionBody: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 2,
  },
});