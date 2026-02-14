import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';

import App from './App';
import { setupNotificationHandler } from './src/services/notifications';

setupNotificationHandler();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

registerRootComponent(App);
