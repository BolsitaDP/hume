import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from './src/navigation/RootNavigator';
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
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
