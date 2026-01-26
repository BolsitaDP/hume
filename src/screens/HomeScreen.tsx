import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';

import { useHabitsStore } from '../store/habits.store';
import { t } from '../i18n';
import { isHabitActiveNow, isHabitScheduledToday, isTimeReached } from '../utils/schedule';

export default function HomeScreen({ navigation }: any) {
  const { habits, hydrated, hydrate, toggleToday, removeHabit } = useHabitsStore();
  const theme = useTheme();

  useEffect(() => {
    hydrate();
  }, [ hydrate ]);

  const { active, upcoming } = useMemo(() => {
    const now = new Date();

    const activeHabits = habits.filter((h) =>
      isHabitActiveNow(h.schedule.days, h.schedule.time, now)
    );

    const upcomingHabits = habits.filter((h) =>
      isHabitScheduledToday(h.schedule.days, now) && !isTimeReached(h.schedule.time, now)
    );

    return { active: activeHabits, upcoming: upcomingHabits };
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
            <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 24 }}>{t('home.empty')}</Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('AddHabit')}
              style={{ marginTop: 8 }}
            >
              {t('home.add_habit')}
            </Button>
          </View>
        ) : (
          <>
            {/* Header Section */}
            <View style={{
              backgroundColor: theme.colors.surfaceVariant,
              marginHorizontal: -16,
              marginTop: -16,
              paddingVertical: 32,
              paddingHorizontal: 24,
              marginBottom: 24,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outline,
            }}>
              <View style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.outline,
                paddingTop: 24,
              }}>
                <Text variant="headlineMedium" style={{
                  fontWeight: '600',
                  marginBottom: 8,
                  textAlign: 'center',
                  letterSpacing: 0.5
                }}>
                  Tu Progreso Diario
                </Text>
                <Text variant="bodyMedium" style={{
                  textAlign: 'center',
                  opacity: 0.7,
                  lineHeight: 22
                }}>
                  Cada pequeño paso cuenta hacia tu mejor versión
                </Text>
              </View>
            </View>

            {active.length === 0 ? (
              <Text style={{ marginBottom: 12 }}>{t('home.no_active')}</Text>
            ) : (
              active.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  onToggleToday={() => toggleToday(h.id)}
                  onDelete={() => removeHabit(h.id)}
                />
              ))
            )}

            <Divider style={{ marginVertical: 12 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {t('home.sections.upcoming')}
            </Text>

            {upcoming.length === 0 ? (
              <Text style={{ marginBottom: 12 }}>{t('home.no_upcoming')}</Text>
            ) : (
              upcoming.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  onToggleToday={() => toggleToday(h.id)}
                  onDelete={() => removeHabit(h.id)}
                />
              ))
            )}

          </>
        )}
      </Animated.ScrollView>

      <View style={{ position: 'absolute', right: 16, bottom: 88 }}>
        <AnimatedFab
          expanded={fabExpanded}
          label={t('home.urgent_motivation')}
          onPress={() => navigation.navigate('UrgentMotivation')}
          icon="flash"
          iconOnly={true}
          backgroundColor={theme.colors.error}
        />
      </View>

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