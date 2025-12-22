import * as Notifications from 'expo-notifications';
import { Habit } from '../store/habits.store';
import { WEEKDAY_TO_EXPO } from '../utils/weekday';

type Params = {
  habit: Habit;
  title: string;
  body: string;
};

export async function scheduleHabitNotifications({
  habit,
  title,
  body,
}: Params) {
  const [ hour, minute ] = habit.schedule.time.split(':').map(Number);

  for (const day of habit.schedule.days) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          habitId: habit.id,
          tag: `habit-${habit.id}`,
        },
      },
      trigger: {
        weekday: WEEKDAY_TO_EXPO[ day ],
        hour,
        minute,
        repeats: true,
        channelId: 'habits',
      },
    });
  }
}
