import React, { useEffect } from 'react';
import { ShareIntentProvider } from 'expo-share-intent';
import { View, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme, Theme as NavTheme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import RootNavigator from './src/navigation/RootNavigator';
import ShareIntentHandler from './src/services/ShareIntentHandler';
import { lightTheme, darkTheme } from './src/ui/theme';
import { useSettingsStore } from './src/store/settings.store';
import { configureAndroidChannel, ensureNotificationPermission } from './src/services/notifications';

export default function App() {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const scheme = useColorScheme();

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
    const { data } = notification.request.content;
    const habitId = (data as any)?.habitId;
    const dayOfWeek = (data as any)?.dayOfWeek;

    if (!habitId || !dayOfWeek) return;

    const secondsInWeek = 7 * 24 * 60 * 60;

    try {
      await Notifications.scheduleNotificationAsync({
        content: notification.request.content,
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
  const theme = themeMode === 'dark' ? darkTheme : themeMode === 'light' ? lightTheme : (scheme === 'dark' ? darkTheme : lightTheme);

  const navBase = (theme as any).dark ? NavDarkTheme : NavDefaultTheme;
  const navTheme: NavTheme = {
    ...navBase,
    colors: {
      ...navBase.colors,
      background: theme.colors.background,
      card: (theme.colors as any).elevation?.level2 ?? theme.colors.surface,
      text: (theme as any).colors?.onBackground ?? ((theme as any).dark ? '#FFFFFF' : '#000000'),
      primary: theme.colors.primary,
      border: theme.colors.outline,
      notification: theme.colors.error,
    },
  };

  return (
    <ShareIntentProvider>
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer theme={navTheme}>
            <ShareIntentHandler />
            <RootNavigator />
          </NavigationContainer>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={5000}
            action={{
              label: '✕',
              onPress: () => setSnackbarVisible(false),
            }}
            style={{
              marginBottom: 80,
              marginHorizontal: 12,
              backgroundColor: (theme.colors as any).primary ?? '#5B7C99',
              borderRadius: 12,
              elevation: 6,
              paddingVertical: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={20}
                color="#FFFFFF"
              />
              <Text
                variant="bodyMedium"
                style={{
                  color: '#FFFFFF',
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
