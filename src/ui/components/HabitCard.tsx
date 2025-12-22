import React from 'react';
import { Card, Checkbox, IconButton, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Habit } from '../../store/habits.store';
import { todayKey } from '../../utils/date';
import { t } from '../../i18n';
import { formatScheduleLabel } from '../../utils/schedule';

type Props = {
  habit: Habit;
  onToggleToday: () => void;
  onDelete?: () => void;
};

export default function HabitCard({ habit, onToggleToday, onDelete }: Props) {
  const doneToday = !!habit.completions[ todayKey() ];
  const scheduleLabel = formatScheduleLabel(habit.schedule.days, habit.schedule.time);

  return (
    <Card style={{ marginBottom: 12 }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox status={doneToday ? 'checked' : 'unchecked'} onPress={onToggleToday} />

          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{habit.title}</Text>

            <Text variant="bodySmall">
              {doneToday ? t('home.completed_today') : t('home.not_done_today')}
              {'  •  '}
              {scheduleLabel}
            </Text>
          </View>

          <IconButton icon="trash-can-outline" onPress={onDelete} />
        </View>
      </Card.Content>
    </Card>
  );
}
