import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';

import { useHabitsStore } from '../store/habits.store';
import { t } from '../i18n';
import { isHabitActiveNow, isHabitScheduledToday, isTimeReached } from '../utils/schedule';

export default function HomeScreen({ navigation }: any) {
  const { habits, hydrated, hydrate, toggleToday, removeHabit } = useHabitsStore();

  useEffect(() => {
    hydrate();
  }, [ hydrate ]);

  const { active, upcoming, inactiveToday } = useMemo(() => {
    const now = new Date();

    const activeHabits = habits.filter((h) =>
      isHabitActiveNow(h.schedule.days, h.schedule.time, now)
    );

    const upcomingHabits = habits.filter((h) =>
      isHabitScheduledToday(h.schedule.days, now) && !isTimeReached(h.schedule.time, now)
    );

    const inactive = habits.filter((h) => !isHabitScheduledToday(h.schedule.days, now));

    return { active: activeHabits, upcoming: upcomingHabits, inactiveToday: inactive };
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {!hydrated ? (
          <Text>{t('common.loading')}</Text>
        ) : habits.length === 0 ? (
          <Text>{t('home.empty')}</Text>
        ) : (
          <>
            <Button
              mode="contained-tonal"
              icon="flash"
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('UrgentMotivation')}
            >
              {t('home.urgent_motivation')}
            </Button>

            <Card style={{ marginBottom: 12 }}>
              <Card.Content>
                <Text variant="titleMedium">{t('home.sections.active')}</Text>
                <Text variant="bodySmall">
                  {t('home.sections.active_hint')}
                </Text>
              </Card.Content>
            </Card>

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

            <Divider style={{ marginVertical: 12 }} />

            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {t('home.sections.other')}
            </Text>

            {inactiveToday.length === 0 ? (
              <Text>{t('home.no_other')}</Text>
            ) : (
              inactiveToday.map((h) => (
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

      <View style={{ position: 'absolute', right: 16, bottom: 16 }}>
        <AnimatedFab
          expanded={fabExpanded}
          label={t('home.add_habit')}
          onPress={() => navigation.navigate('AddHabit')}
        />
      </View>
    </View>
  );
}