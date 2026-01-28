import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { List, Menu, Switch, Text } from 'react-native-paper';
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

  const [ languageMenuVisible, setLanguageMenuVisible ] = useState(false);
  const [ toneMenuVisible, setToneMenuVisible ] = useState(false);

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
      <List.Section>
        <Menu
          visible={languageMenuVisible}
          onDismiss={() => setLanguageMenuVisible(false)}
          anchor={
            <List.Item
              title={t('settings.language')}
              description={locale === 'en' ? t('language.en') : t('language.es')}
              onPress={() => setLanguageMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => { setLocale('en'); setLanguageMenuVisible(false); }} title={t('language.en')} />
          <Menu.Item onPress={() => { setLocale('es'); setLanguageMenuVisible(false); }} title={t('language.es')} />
        </Menu>
      </List.Section>

      <List.Section>
        <Menu
          visible={toneMenuVisible}
          onDismiss={() => setToneMenuVisible(false)}
          anchor={
            <List.Item
              title={t('settings.tone_level')}
              description={t(`tone.level${toneLevel}`)}
              onPress={() => setToneMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={() => { setToneLevel(0); setToneMenuVisible(false); }} title={t('tone.level0')} />
          <Menu.Item onPress={() => { setToneLevel(1); setToneMenuVisible(false); }} title={t('tone.level1')} />
          <Menu.Item onPress={() => { setToneLevel(2); setToneMenuVisible(false); }} title={t('tone.level2')} />
          <Menu.Item onPress={() => { setToneLevel(3); setToneMenuVisible(false); }} title={t('tone.level3')} />
        </Menu>
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
