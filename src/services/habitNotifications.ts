import * as Notifications from 'expo-notifications';
import { Habit } from '../store/habits.store';
import { WEEKDAY_TO_EXPO } from '../utils/weekday';
import { HABITS_CHANNEL_ID, createNotificationContent } from './notifications';

type Params = {
  habit: Habit;
  title: string;
  body: string;
};

function calculateSecondsToNextNotification(targetDay: number, hour: number, minute: number): number {
  const now = new Date();
  const currentDayOfWeek = now.getDay();

  const jsDay = targetDay === 1 ? 0 : targetDay - 1;
  let daysUntilTarget = jsDay - currentDayOfWeek;

  if (daysUntilTarget === 0) {
    const targetSeconds = hour * 3600 + minute * 60;
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    if (currentSeconds < targetSeconds) {
      return targetSeconds - currentSeconds;
    } else {
      daysUntilTarget = 7;
    }
  } else if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  }

  return daysUntilTarget * 86400 + hour * 3600 + minute * 60;
}

export async function scheduleHabitNotifications({
  habit,
  title,
  body,
}: Params) {
  const [ hour, minute ] = habit.schedule.time.split(':').map(Number);

  for (const day of habit.schedule.days) {
    const expoDay = WEEKDAY_TO_EXPO[ day ];
    const secondsUntilNext = calculateSecondsToNextNotification(expoDay, hour, minute);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: createNotificationContent(
        title,
        body,
        {
          habitId: habit.id,
          tag: `habit-${habit.id}`,
          dayOfWeek: day,
          hour: hour.toString(),
          minute: minute.toString(),
        }
      ),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(5, secondsUntilNext),
        channelId: HABITS_CHANNEL_ID,
      },
    });
  }
}
