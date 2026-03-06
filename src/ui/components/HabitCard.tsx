import React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

import { Habit } from '../../store/habits.store';
import { todayKey } from '../../utils/date';
import { getCategoryColor } from '../../utils/categoryColors';
import { t } from '../../i18n';
import { formatScheduleLabel } from '../../utils/schedule';
import { AppTheme } from '../theme';
import { glassPanel, withAlpha } from '../glass';

type Props = {
  habit: Habit;
  onToggleToday?: () => void;
  onPress?: () => void;
  canToggleToday?: boolean;
};

export default function HabitCard({ habit, onToggleToday, onPress, canToggleToday = true }: Props) {
  const doneToday = !!habit.completions[ todayKey() ];
  const scheduleLabel = formatScheduleLabel(habit.schedule.days, habit.schedule.time);
  const theme = useTheme() as AppTheme;

  const categoryColor = getCategoryColor(habit.category, theme);

  return (
    <Card
      style={{
        ...glassPanel(theme, 'soft'),
        marginBottom: 12,
        backgroundColor: withAlpha(categoryColor, theme.dark ? 0.34 : 0.56),
        borderColor: withAlpha(theme.colors.outlineVariant, theme.dark ? 0.7 : 0.55),
      }}
    >
      <Card.Content style={{ paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            disabled={!onPress}
            style={{ flex: 1 }}
          >
            <View>
              <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                {habit.title}
              </Text>

              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                {doneToday ? t('home.completed_today') : t('home.not_done_today')}
                {'  •  '}
                {scheduleLabel}
              </Text>
            </View>
          </TouchableOpacity>

          {canToggleToday && (
            <IconButton
              mode="contained"
              icon={doneToday ? 'check-bold' : 'check'}
              size={20}
              onPress={() => {
                if (doneToday) {
                  Alert.alert(
                    t('habit_detail.already_marked_title'),
                    t('habit_detail.already_marked_message')
                  );
                } else {
                  onToggleToday?.();
                }
              }}
              style={{ marginLeft: 10 }}
              containerColor={doneToday ? theme.colors.success : theme.colors.primary}
              iconColor={doneToday ? theme.colors.onSuccess : theme.colors.onPrimary}
              accessibilityLabel={doneToday ? t('habit_detail.completed_today') : t('habit_detail.mark_complete')}
            />
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
