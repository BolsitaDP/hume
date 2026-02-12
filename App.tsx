import React, { useEffect } from 'react';
import { ShareIntentProvider } from 'expo-share-intent';
import { View, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme, Theme as NavTheme } from '@react-navigation/native';

import RootNavigator from './src/navigation/RootNavigator';
import ShareIntentHandler from './src/services/ShareIntentHandler';
import { lightTheme, darkTheme } from './src/ui/theme';
import { useSettingsStore } from './src/store/settings.store';
import { configureAndroidChannel, setupNotificationHandler } from './src/services/notifications';

export default function App() {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const themeMode = useSettingsStore((s) => s.themeMode);
  // Keep hook order stable across renders: call useColorScheme before early returns
  const scheme = useColorScheme();

  useEffect(() => {
    setupNotificationHandler();
    configureAndroidChannel();
    hydrateSettings();
  }, [hydrateSettings]);

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
        </View>
      </PaperProvider>
    </ShareIntentProvider>
  );
}
