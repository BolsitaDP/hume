import React from 'react';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Habit } from '../../store/habits.store';
import { todayKey } from '../../utils/date';
import { getCategoryColor } from '../../utils/categoryColors';
import { t } from '../../i18n';
import { formatScheduleLabel } from '../../utils/schedule';

type Props = {
  habit: Habit;
  onToggleToday: () => void;
  onPress?: () => void;
};

export default function HabitCard({ habit, onToggleToday, onPress }: Props) {
  const doneToday = !!habit.completions[todayKey()];
  const scheduleLabel = formatScheduleLabel(habit.schedule.days, habit.schedule.time);
  const theme = useTheme();

  const categoryColor = getCategoryColor(habit.category, theme as any);

  return (
    <Card style={{ marginBottom: 12, backgroundColor: categoryColor, borderLeftWidth: 4, borderLeftColor: categoryColor }}>
      <Card.Content style={{ paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
            style={{ flex: 1 }}
          >
            <View>
              <Text variant="titleMedium">{habit.title}</Text>

              <Text variant="bodySmall">
                {doneToday ? t('home.completed_today') : t('home.not_done_today')}
                {'  •  '}
                {scheduleLabel}
              </Text>
            </View>
          </TouchableOpacity>

          <IconButton
            mode="contained"
            icon="check"
            size={22}
            onPress={() => {
              if (doneToday) {
                Alert.alert(
                  t('habit_detail.already_marked_title'),
                  t('habit_detail.already_marked_message')
                );
              } else {
                onToggleToday();
              }
            }}
            style={{ marginLeft: 8 }}
            containerColor={doneToday ? theme.colors.success : theme.colors.primary}
            iconColor={doneToday ? theme.colors.onSuccess : theme.colors.onPrimary}
            accessibilityLabel={doneToday ? t('habit_detail.completed_today') : t('habit_detail.mark_complete')}
          />
        </View>
      </Card.Content>
    </Card>
  );
}




