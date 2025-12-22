import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, RadioButton, Switch, Text } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabsParamList } from '../navigation/TabsNavigator';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { ensureNotificationPermission, cancelAllScheduled, scheduleDailyReminder } from '../services/notifications';
import { pickRageMessage } from '../services/rageMessages';

type Props = BottomTabScreenProps<TabsParamList, 'SettingsTab'>;

export default function SettingsScreen({ }: Props) {
  const {
    locale,
    toneLevel,
    notificationsEnabled,
    notificationTime,
    setLocale,
    setToneLevel,
    setNotificationsEnabled,
    setNotificationTime,
  } = useSettingsStore();

  // Reprograma noti cada vez que cambien settings relevantes
  useEffect(() => {
    (async () => {
      await cancelAllScheduled();

      if (!notificationsEnabled) return;

      const ok = await ensureNotificationPermission();
      if (!ok) return;

      const [ h, m ] = notificationTime.split(':').map((x) => Number(x));
      const body = pickRageMessage(locale, toneLevel);

      await scheduleDailyReminder({
        hour: h,
        minute: m,
        title: t('notifications.title'),
        body,
      });
    })();
  }, [ locale, toneLevel, notificationsEnabled, notificationTime ]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <List.Section title={t('settings.language')}>
        <RadioButton.Group value={locale} onValueChange={(v) => setLocale(v as any)}>
          <RadioButton.Item label={t('language.en')} value="en" />
          <RadioButton.Item label={t('language.es')} value="es" />
        </RadioButton.Group>
      </List.Section>

      <List.Section title={t('settings.tone_level')}>
        <RadioButton.Group value={String(toneLevel)} onValueChange={(v) => setToneLevel(Number(v) as any)}>
          <RadioButton.Item label={t('tone.level0')} value="0" />
          <RadioButton.Item label={t('tone.level1')} value="1" />
          <RadioButton.Item label={t('tone.level2')} value="2" />
          <RadioButton.Item label={t('tone.level3')} value="3" />
        </RadioButton.Group>
      </List.Section>

      <List.Section>
        <List.Item
          title={t('settings.enable_notifications')}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => setNotificationsEnabled(v)}
            />
          )}
        />

        <Text style={{ marginTop: 8 }}>{t('settings.notification_time')}</Text>
        {/* simple: editable string HH:mm (luego lo cambiamos por TimePicker Android nativo) */}
        <List.Item
          title={notificationTime}
          description="Format: HH:mm"
          onPress={async () => {
            // súper básico por ahora: alterna 09:00 / 20:00 (luego hacemos TimePicker nativo)
            const next = notificationTime === '09:00' ? '20:00' : '09:00';
            await setNotificationTime(next);
          }}
        />
      </List.Section>
    </View>
  );
}
