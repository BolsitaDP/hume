import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, useTheme } from 'react-native-paper';

import HabitCard from '../ui/components/HabitCard';
import AnimatedFab from '../ui/components/AnimatedFab';
import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';
import { useHabitsStore } from '../store/habits.store';
import { t } from '../i18n';
import { isHabitScheduledToday } from '../utils/schedule';
import { AppTheme } from '../ui/theme';
import { glassPanel } from '../ui/glass';

export default function HomeScreen({ navigation }: any) {
  const { habits, hydrated, hydrate, toggleToday } = useHabitsStore();
  const theme = useTheme() as AppTheme;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    hydrate();
  }, [ hydrate ]);

  const habitsToday = useMemo(() => {
    const now = new Date();
    return habits.filter((h) => isHabitScheduledToday(h.schedule.days, now));
  }, [ habits ]);

  const [ fabExpanded, setFabExpanded ] = useState(true);
  const baseFabBottom = Math.max(16, insets.bottom + 8);
  const secondaryFabBottom = baseFabBottom + 68;

  return (
    <View style={{ flex: 1 }}>
      <FancyHeaderLayout
        title={t('home.daily_progress_title')}
        subtitle={t('home.daily_progress_subtitle')}
        collapsedTitleOffset={20}
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
            <Text style={{ textAlign: 'center', fontSize: 16, color: theme.colors.onSurface }}>{t('common.loading')}</Text>
          </View>
        ) : habits.length === 0 ? (
          <View
            style={{
              ...glassPanel(theme, 'soft'),
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              paddingHorizontal: 28,
              paddingVertical: 28,
              backgroundColor: theme.colors.elevation.level2,
            }}
          >
            <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 24, color: theme.colors.onSurfaceVariant }}>
              {t('home.empty')}
            </Text>

            <Button mode="contained" icon="plus" onPress={() => navigation.navigate('AddHabit')} style={{ borderRadius: 14 }}>
              {t('home.add_habit')}
            </Button>
          </View>
        ) : (
          <>
            {habitsToday.length === 0 ? (
              <View
                style={{
                  ...glassPanel(theme, 'soft'),
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginBottom: 10,
                  backgroundColor: theme.colors.elevation.level2,
                }}
              >
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('home.no_upcoming')}</Text>
              </View>
            ) : (
              habitsToday.map((h) => (
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

      <View style={{ position: 'absolute', right: 20, bottom: secondaryFabBottom }}>
        <AnimatedFab
          expanded={fabExpanded}
          label={t('home.urgent_motivation')}
          onPress={() => navigation.navigate('UrgentMotivation')}
          icon="lightning-bolt"
          iconOnly={true}
          backgroundColor={theme.colors.errorContainer}
          textColorDark={theme.colors.onErrorContainer}
          textColorLight={theme.colors.onErrorContainer}
        />
      </View>

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
