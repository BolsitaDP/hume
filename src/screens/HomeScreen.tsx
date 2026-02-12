import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Divider, Text, useTheme } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';
import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';
import { useHabitsStore } from '../store/habits.store';

import { t } from '../i18n';
import { isHabitActiveNow, isHabitScheduledToday, isTimeReached } from '../utils/schedule';

export default function HomeScreen({ navigation }: any) {
  const { habits, hydrated, hydrate, toggleToday } = useHabitsStore();
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
  const [ fabExpanded, setFabExpanded ] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <FancyHeaderLayout
        title={t('home.daily_progress_title')}
        subtitle={t('home.daily_progress_subtitle')}
        isEmpty={habits.length === 0}
        onScrollY={(y) => {
          if (y > 60 && fabExpanded) setFabExpanded(false);
          if (y < 20 && !fabExpanded) setFabExpanded(true);
        }}
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
            {active.length === 0 ? (
              <Text style={{ marginBottom: 12 }}>{t('home.no_active')}</Text>
            ) : (
              active.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  onToggleToday={() => toggleToday(h.id)}
                  onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
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
                  onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                />
              ))
            )}

          </>
        )}
      </FancyHeaderLayout>

      <View style={{ position: 'absolute', right: 16, bottom: 88 }}>
        <AnimatedFab
          expanded={fabExpanded}
          label={t('home.urgent_motivation')}
          onPress={() => navigation.navigate('UrgentMotivation')}
          icon="flash"
          iconOnly={true}
          backgroundColor={theme.colors.urgent}
          textColorDark={theme.colors.onUrgent}
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













