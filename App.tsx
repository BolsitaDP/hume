import React, { useEffect } from 'react';
import { ShareIntentProvider } from 'expo-share-intent';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from './src/navigation/RootNavigator';
import ShareIntentHandler from './src/services/ShareIntentHandler';
import { theme } from './src/ui/theme';
import { useSettingsStore } from './src/store/settings.store';
import { setupNotificationHandler } from './src/services/notifications';

export default function App() {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    setupNotificationHandler();
    hydrateSettings();
  }, [ hydrateSettings ]);

  if (!hydrated) return null;

  return (
    <ShareIntentProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <ShareIntentHandler />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ShareIntentProvider>
  );
}