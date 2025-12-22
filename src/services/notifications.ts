import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Para que en foreground también se muestre (sin sonido molesto)
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermission() {
  if (!Device.isDevice) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function configureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('habits', {
    name: 'Habits',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [ 0, 250, 250, 250 ],
    sound: 'default',
  });
}

// Cancela TODO lo relacionado a un hábito (tag = habit-<id>)
export async function cancelNotificationsByTag(tag: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  const toCancel = scheduled.filter((n) => n.content.data?.tag === tag);

  await Promise.all(
    toCancel.map((n) =>
      Notifications.cancelScheduledNotificationAsync(n.identifier)
    )
  );
}

// Cancela todas las notificaciones programadas
export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Programa un recordatorio diario
export async function scheduleDailyReminder(options: {
  hour: number;
  minute: number;
  title: string;
  body: string;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title,
      body: options.body,
      data: { tag: 'daily-reminder' },
    },
    trigger: {
      type: 'calendar',
      hour: options.hour,
      minute: options.minute,
      repeats: true,
    },
  });
}
