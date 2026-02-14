import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const HABITS_CHANNEL_ID = 'habits-v2';

export function createNotificationContent(title: string, body: string, data?: Record<string, any>) {
  return {
    title,
    body,
    data: data || {},
    sound: true,
    ios: {
      sound: true,
    },
    android: {
      sound: 'default',
      priority: 'high' as const,
      vibrate: [ 0, 250, 250, 250 ],
    },
  };
}

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  } as any);

  return req.granted ?? false;
}

export async function configureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(HABITS_CHANNEL_ID, {
    name: 'Habits',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [ 0, 250, 250, 250 ],
    sound: 'default',
    lightColor: '#5B7C99',
    enableVibrate: true,
    bypassDnd: false,
  });
}

export async function cancelNotificationsByTag(tag: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.content.data?.tag === tag);

  await Promise.all(
    toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyReminder(options: {
  hour: number;
  minute: number;
  title: string;
  body: string;
}) {
  await configureAndroidChannel();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: createNotificationContent(
      options.title,
      options.body,
      { tag: 'daily-reminder' }
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: options.hour,
      minute: options.minute,
      channelId: HABITS_CHANNEL_ID,
    },
  });

  return notificationId;
}
