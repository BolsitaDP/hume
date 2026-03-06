import React, { useEffect } from 'react';
import { ShareIntentProvider } from 'expo-share-intent';
import { View } from 'react-native';
import { PaperProvider, Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  DarkTheme as NavDarkTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import RootNavigator from './src/navigation/RootNavigator';
import ShareIntentHandler from './src/services/ShareIntentHandler';
import { darkTheme, AppTheme } from './src/ui/theme';
import { useSettingsStore } from './src/store/settings.store';
import { configureAndroidChannel, ensureNotificationPermission } from './src/services/notifications';
import LiquidGlassBackground from './src/ui/components/LiquidGlassBackground';
import { glassPanel, withAlpha } from './src/ui/glass';

export default function App() {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  const [ snackbarVisible, setSnackbarVisible ] = React.useState(false);
  const [ snackbarMessage, setSnackbarMessage ] = React.useState('');

  useEffect(() => {
    configureAndroidChannel();
    ensureNotificationPermission();
    hydrateSettings();

    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title || '';
      const body = notification.request.content.body || '';
      const message = title ? `${title}: ${body}` : body;

      setSnackbarMessage(message);
      setSnackbarVisible(true);

      handleHabitNotificationReschedule(notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleHabitNotificationReschedule(response.notification);
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [ hydrateSettings ]);

  const handleHabitNotificationReschedule = async (notification: Notifications.Notification) => {
    const { title, subtitle, body, data, sound, badge } = notification.request.content;
    const habitId = (data as any)?.habitId;
    const dayOfWeek = (data as any)?.dayOfWeek;

    if (!habitId || !dayOfWeek) return;

    const secondsInWeek = 7 * 24 * 60 * 60;
    const content: Notifications.NotificationContentInput = {
      title,
      subtitle,
      body,
      data,
      sound: sound ?? undefined,
      badge: badge ?? undefined,
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsInWeek,
          channelId: 'habits-v2',
        },
      });
    } catch (error) {
      console.error('Error rescheduling notification:', error);
    }
  };

  if (!hydrated) return null;

  const theme: AppTheme = darkTheme;

  const navTheme: NavTheme = {
    ...NavDarkTheme,
    colors: {
      ...NavDarkTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      primary: theme.colors.primary,
      border: withAlpha(theme.colors.outlineVariant, 0.8),
      notification: theme.colors.error,
    },
  };

  return (
    <ShareIntentProvider>
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <LiquidGlassBackground />

          <NavigationContainer theme={navTheme}>
            <ShareIntentHandler />
            <RootNavigator />
          </NavigationContainer>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={5000}
            action={{
              label: 'x',
              labelStyle: { color: theme.colors.onSurface, fontWeight: '700' },
              onPress: () => setSnackbarVisible(false),
            }}
            style={{
              ...glassPanel(theme, 'strong'),
              marginBottom: 84,
              marginHorizontal: 14,
              borderRadius: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurface,
                  flex: 1,
                  fontWeight: '500',
                }}
              >
                {snackbarMessage}
              </Text>
            </View>
          </Snackbar>
        </View>
      </PaperProvider>
    </ShareIntentProvider>
  );
}