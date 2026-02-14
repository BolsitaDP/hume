import { WeekDay } from '../store/habits.store';
import { t } from '../i18n';

const WEEK_MAP: WeekDay[] = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];

export function getTodayWeekDay(date = new Date()): WeekDay {
  return WEEK_MAP[ date.getDay() ];
}

export function isHabitScheduledToday(
  habitDays: WeekDay[],
  date = new Date()
) {
  return habitDays.includes(getTodayWeekDay(date));
}

export function isTimeReached(
  habitTime: string,
  date = new Date()
) {
  const [ h, m ] = habitTime.split(':').map(Number);
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const habitMinutes = h * 60 + m;

  return nowMinutes >= habitMinutes;
}

export function formatScheduleLabel(days: WeekDay[], time: string) {
  if (!days.length) return time;

  const order: WeekDay[] = [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ];

  const sortedDays = [ ...days ].sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );

  const translatedDays = sortedDays.map((day) => t(`week.${day}`));
  return `${translatedDays.join(', ')} - ${time}`;
}

export function isHabitActiveNow(
  days: WeekDay[],
  time: string,
  date = new Date()
): boolean {
  return (
    isHabitScheduledToday(days, date) &&
    isTimeReached(time, date)
  );
}

