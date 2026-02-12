import React, { useEffect, useState } from 'react';
import { List, Switch, Button, Portal, Dialog, RadioButton } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { ensureNotificationPermission, configureAndroidChannel, HABITS_CHANNEL_ID } from '../services/notifications';
import { pickRageMessage } from '../services/rageMessages';


type ThemeMode = 'system' | 'light' | 'dark';
type DebugScheduledItem = {
  id: string;
  title: string;
  tag: string;
  trigger: string;
};

export default function SettingsScreen({ }) {
  const {
    locale,
    toneLevel,
    notificationsEnabled,
    themeMode,
    setLocale,
    setToneLevel,
    setNotificationsEnabled,
    setThemeMode,
  } = useSettingsStore();

  // Dialog state + temp selections
  const [ langVisible, setLangVisible ] = useState(false);
  const [ themeVisible, setThemeVisible ] = useState(false);
  const [ toneVisible, setToneVisible ] = useState(false);

  const [ tmpLocale, setTmpLocale ] = useState(locale);
  const [ tmpTheme, setTmpTheme ] = useState<ThemeMode>(themeMode);
  const [ tmpTone, setTmpTone ] = useState<0 | 1 | 2 | 3>(toneLevel);
  const [ debugPermission, setDebugPermission ] = useState(t('settings.debug_unknown'));
  const [ debugScheduled, setDebugScheduled ] = useState<DebugScheduledItem[]>([]);

  // Sync temp values when opening
  useEffect(() => { if (langVisible) setTmpLocale(locale); }, [ langVisible ]);
  useEffect(() => { if (themeVisible) setTmpTheme(themeMode); }, [ themeVisible ]);
  useEffect(() => { if (toneVisible) setTmpTone(toneLevel); }, [ toneVisible ]);

  const refreshNotificationDebug = async () => {
    const permission = await Notifications.getPermissionsAsync();
    setDebugPermission(permission.status);

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const mapped = scheduled.map((item) => {
      const triggerType = (item.trigger as any)?.type ?? t('settings.debug_unknown');
      return {
        id: item.identifier,
        title: item.content.title ?? t('settings.debug_untitled'),
        tag: String(item.content.data?.tag ?? t('settings.debug_none')),
        trigger: String(triggerType),
      };
    });
    setDebugScheduled(mapped);
  };

  useEffect(() => {
    refreshNotificationDebug();
  }, [ notificationsEnabled, locale, toneLevel ]);

  return (
    <FancyHeaderLayout title={t('nav.settings')}>
      <Portal>
        {/* Idioma */}
        <Dialog visible={langVisible} onDismiss={() => setLangVisible(false)} style={{ borderRadius: 12 }}>
          <Dialog.Title>{t('settings.language')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setTmpLocale(v as any)} value={tmpLocale}>
              <RadioButton.Item label={t('language.en')} value="en" />
              <RadioButton.Item label={t('language.es')} value="es" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLangVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={async () => { await setLocale(tmpLocale); setLangVisible(false); }}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Tema */}
        <Dialog visible={themeVisible} onDismiss={() => setThemeVisible(false)} style={{ borderRadius: 12 }}>
          <Dialog.Title>{t('settings.theme')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setTmpTheme(v as ThemeMode)} value={tmpTheme}>
              <RadioButton.Item label={t('settings.theme_system')} value="system" />
              <RadioButton.Item label={t('settings.theme_light')} value="light" />
              <RadioButton.Item label={t('settings.theme_dark')} value="dark" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={async () => { await setThemeMode(tmpTheme); setThemeVisible(false); }}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Nivel de tono */}
        <Dialog visible={toneVisible} onDismiss={() => setToneVisible(false)} style={{ borderRadius: 12 }}>
          <Dialog.Title>{t('settings.tone_level')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setTmpTone(Number(v) as 0 | 1 | 2 | 3)} value={tmpTone as any}>
              <RadioButton.Item label={t('tone.level0')} value={0 as any} />
              <RadioButton.Item label={t('tone.level1')} value={1 as any} />
              <RadioButton.Item label={t('tone.level2')} value={2 as any} />
              <RadioButton.Item label={t('tone.level3')} value={3 as any} />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setToneVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={async () => { await setToneLevel(tmpTone); setToneVisible(false); }}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Idioma */}
      <List.Section>
        <List.Item
          title={t('settings.language')}
          description={locale === 'en' ? t('language.en') : t('language.es')}
          onPress={() => setLangVisible(true)}
        />
      </List.Section>

      {/* Tema */}
      <List.Section>
        <List.Item
          title={t('settings.theme')}
          description={themeMode === 'system' ? t('settings.theme_system') : themeMode === 'light' ? t('settings.theme_light') : t('settings.theme_dark')}
          onPress={() => setThemeVisible(true)}
        />
      </List.Section>

      {/* Nivel de tono */}
      <List.Section>
        <List.Item
          title={t('settings.tone_level')}
          description={t(`tone.level${toneLevel}`)}
          onPress={() => setToneVisible(true)}
        />
      </List.Section>

      {/* Notificaciones */}
      <List.Section>
        <List.Item
          title={t('settings.enable_notifications')}
          right={() => (
            <Switch value={notificationsEnabled} onValueChange={(v) => setNotificationsEnabled(v)} />
          )}
        />
        <Button
          mode="contained-tonal"
          style={{ alignSelf: 'flex-start', marginTop: 8 }}
          onPress={async () => {
            const ok = await ensureNotificationPermission();
            if (!ok) return;
            await configureAndroidChannel();
            const body = pickRageMessage(locale, toneLevel);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: t('notifications.title'),
                body,
                data: { tag: 'manual-test' },
                sound: true,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 5,
                channelId: HABITS_CHANNEL_ID,
              },
            });
          }}
        >
          {t('settings.test_notification_5s')}
        </Button>
      </List.Section>

      <List.Section>
        <List.Item
          title={t('settings.debug_notifications')}
          description={t('settings.debug_status', { permission: debugPermission, count: debugScheduled.length })}
        />
        <Button mode="outlined" onPress={refreshNotificationDebug}>
          {t('settings.debug_refresh')}
        </Button>
        {debugScheduled.slice(0, 8).map((item) => (
          <List.Item
            key={item.id}
            title={`${item.title} (${item.trigger})`}
            description={t('settings.debug_item', { tag: item.tag, id: item.id })}
          />
        ))}
      </List.Section>
    </FancyHeaderLayout>
  );
}
