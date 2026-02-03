import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { List, Switch, Text, Button, Portal, Dialog, RadioButton } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabsParamList } from '../navigation/TabsNavigator';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { ensureNotificationPermission, cancelAllScheduled, scheduleDailyReminder } from '../services/notifications';
import { pickRageMessage } from '../services/rageMessages';

type Props = BottomTabScreenProps<TabsParamList, 'SettingsTab'>;

type ThemeMode = 'system' | 'light' | 'dark';

export default function SettingsScreen({ }: Props) {
  const {
    locale,
    toneLevel,
    notificationsEnabled,
    notificationTime,
    themeMode,
    setLocale,
    setToneLevel,
    setNotificationsEnabled,
    setNotificationTime,
    setThemeMode,
  } = useSettingsStore();

  // Dialog state + temp selections
  const [ langVisible, setLangVisible ] = useState(false);
  const [ themeVisible, setThemeVisible ] = useState(false);
  const [ toneVisible, setToneVisible ] = useState(false);

  const [ tmpLocale, setTmpLocale ] = useState(locale);
  const [ tmpTheme, setTmpTheme ] = useState<ThemeMode>(themeMode);
  const [ tmpTone, setTmpTone ] = useState<0 | 1 | 2 | 3>(toneLevel);

  // Sync temp values when opening
  useEffect(() => { if (langVisible) setTmpLocale(locale); }, [ langVisible ]);
  useEffect(() => { if (themeVisible) setTmpTheme(themeMode); }, [ themeVisible ]);
  useEffect(() => { if (toneVisible) setTmpTone(toneLevel); }, [ toneVisible ]);

  // Reprograma notificaciones cuando cambian settings relevantes
  useEffect(() => {
    (async () => {
      await cancelAllScheduled();
      if (!notificationsEnabled) return;
      const ok = await ensureNotificationPermission();
      if (!ok) return;
      const [ h, m ] = notificationTime.split(':').map((x) => Number(x));
      const body = pickRageMessage(locale, toneLevel);
      await scheduleDailyReminder({ hour: h, minute: m, title: t('notifications.title'), body });
    })();
  }, [ locale, toneLevel, notificationsEnabled, notificationTime ]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
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
          <Dialog.Title>Tema</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setTmpTheme(v as ThemeMode)} value={tmpTheme}>
              <RadioButton.Item label="Seguir sistema" value="system" />
              <RadioButton.Item label="Claro" value="light" />
              <RadioButton.Item label="Oscuro" value="dark" />
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
          title="Tema"
          description={themeMode === 'system' ? 'Seguir sistema' : themeMode === 'light' ? 'Claro' : 'Oscuro'}
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

        <Text style={{ marginTop: 8 }}>{t('settings.notification_time')}</Text>
        <List.Item
          title={notificationTime}
          description="Format: HH:mm"
          onPress={async () => {
            const next = notificationTime === '09:00' ? '20:00' : '09:00';
            await setNotificationTime(next);
          }}
        />
      </List.Section>
    </View>
  );
}
