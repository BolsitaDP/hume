import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, List, Portal, RadioButton, useTheme } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';

import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { configureAndroidChannel, ensureNotificationPermission } from '../services/notifications';
import { AppTheme } from '../ui/theme';
import { glassPanel, withAlpha } from '../ui/glass';

const LEGAL_LINKS = {
  privacyPolicy: 'https://bolsitadp.github.io/hume/privacy.html',
  termsOfService: 'https://bolsitadp.github.io/hume/terms.html',
  dataDeletion: 'https://bolsitadp.github.io/hume/data-deletion.html',
  support: 'mailto:sgiraldo118@gmail.com',
};

export default function SettingsScreen() {
  const { locale, setLocale, toneLevel, setToneLevel } = useSettingsStore();
  const theme = useTheme() as AppTheme;

  const [ langVisible, setLangVisible ] = useState(false);
  const [ toneVisible, setToneVisible ] = useState(false);
  const [ tmpLocale, setTmpLocale ] = useState(locale);
  const [ tmpTone, setTmpTone ] = useState<0 | 1 | 2 | 3>(toneLevel);
  const [ hasNotificationPermission, setHasNotificationPermission ] = useState(true);

  useEffect(() => {
    if (langVisible) setTmpLocale(locale);
  }, [ langVisible, locale ]);

  useEffect(() => {
    if (toneVisible) setTmpTone(toneLevel);
  }, [ toneVisible, toneLevel ]);

  const refreshNotificationPermission = async () => {
    const permission = await Notifications.getPermissionsAsync();
    setHasNotificationPermission(permission.granted);
  };

  useEffect(() => {
    refreshNotificationPermission();
  }, []);

  const openExternal = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // no-op
    }
  };

  return (
    <FancyHeaderLayout title={t('nav.settings')} expandedPct={0.11} collapsedPct={0.11} scrollDistance={1}>
      <Portal>
        <Dialog
          visible={langVisible}
          onDismiss={() => setLangVisible(false)}
          style={{
            ...glassPanel(theme, 'strong'),
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <Dialog.Title>{t('settings.language')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setTmpLocale(v as any)} value={tmpLocale}>
              <RadioButton.Item label={t('language.en')} value="en" />
              <RadioButton.Item label={t('language.es')} value="es" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLangVisible(false)}>{t('common.cancel')}</Button>
            <Button
              onPress={async () => {
                await setLocale(tmpLocale);
                setLangVisible(false);
              }}
            >
              {t('common.ok')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={toneVisible}
          onDismiss={() => setToneVisible(false)}
          style={{
            ...glassPanel(theme, 'strong'),
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
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
            <Button
              onPress={async () => {
                await setToneLevel(tmpTone);
                setToneVisible(false);
              }}
            >
              {t('common.ok')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View
        style={{
          ...glassPanel(theme, 'soft'),
          backgroundColor: theme.colors.elevation.level2,
          marginBottom: 12,
          borderRadius: 18,
        }}
      >
        <List.Section>
          <List.Item
            title={t('settings.language')}
            description={locale === 'en' ? t('language.en') : t('language.es')}
            onPress={() => setLangVisible(true)}
            left={(props) => <List.Icon {...props} icon="translate" />}
          />

          <List.Item
            title={t('settings.tone_level')}
            description={t(`tone.level${toneLevel}`)}
            onPress={() => setToneVisible(true)}
            left={(props) => <List.Icon {...props} icon="volume-high" />}
          />
        </List.Section>
      </View>

      {!hasNotificationPermission && (
        <View
          style={{
            ...glassPanel(theme, 'soft'),
            backgroundColor: theme.colors.elevation.level2,
            marginBottom: 12,
            borderRadius: 18,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
        >
          <Button
            mode="contained"
            style={{ alignSelf: 'flex-start', borderRadius: 12 }}
            onPress={async () => {
              const ok = await ensureNotificationPermission();
              if (!ok) return;

              await configureAndroidChannel();
              setHasNotificationPermission(true);
            }}
          >
            {t('settings.enable_notifications')}
          </Button>
        </View>
      )}

      <View
        style={{
          ...glassPanel(theme, 'soft'),
          backgroundColor: theme.colors.elevation.level2,
          borderRadius: 18,
        }}
      >
        <List.Section>
          <List.Subheader>{t('settings.legal_section')}</List.Subheader>
          <List.Item
            title={t('settings.privacy_policy')}
            description={t('settings.privacy_policy_hint')}
            onPress={() => openExternal(LEGAL_LINKS.privacyPolicy)}
            left={(props) => <List.Icon {...props} icon="shield-lock-outline" />}
          />
          <List.Item
            title={t('settings.data_deletion')}
            description={t('settings.data_deletion_hint')}
            onPress={() => openExternal(LEGAL_LINKS.dataDeletion)}
            left={(props) => <List.Icon {...props} icon="database-remove-outline" />}
          />
          <List.Item
            title={t('settings.terms_of_service')}
            description={t('settings.terms_of_service_hint')}
            onPress={() => openExternal(LEGAL_LINKS.termsOfService)}
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          />
          <List.Item
            title={t('settings.support')}
            description={t('settings.support_hint')}
            onPress={() => openExternal(LEGAL_LINKS.support)}
            left={(props) => <List.Icon {...props} icon="email-outline" />}
          />
        </List.Section>
      </View>
    </FancyHeaderLayout>
  );
}
