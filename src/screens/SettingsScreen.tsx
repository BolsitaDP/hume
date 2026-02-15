import React, { useEffect, useState } from 'react';
import { List, Button, Portal, Dialog, RadioButton } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';

import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { ensureNotificationPermission, configureAndroidChannel } from '../services/notifications';

const LEGAL_LINKS = {
  // TODO: Replace <your-username> and <repo-name> with your GitHub Pages values.
  privacyPolicy: 'https://<your-username>.github.io/<repo-name>/privacy.html',
  termsOfService: 'https://<your-username>.github.io/<repo-name>/terms.html',
  dataDeletion: 'https://<your-username>.github.io/<repo-name>/data-deletion.html',
  support: 'mailto:your-support@email.com',
};

export default function SettingsScreen({ }) {
  const {
    locale,
    setLocale,
    toneLevel,
    setToneLevel,
  } = useSettingsStore();

  // Dialog state + temp selections
  const [ langVisible, setLangVisible ] = useState(false);
  const [ toneVisible, setToneVisible ] = useState(false);

  const [ tmpLocale, setTmpLocale ] = useState(locale);
  const [ tmpTone, setTmpTone ] = useState<0 | 1 | 2 | 3>(toneLevel);
  const [ hasNotificationPermission, setHasNotificationPermission ] = useState(true);

  // Sync temp values when opening
  useEffect(() => { if (langVisible) setTmpLocale(locale); }, [ langVisible ]);
  useEffect(() => { if (toneVisible) setTmpTone(toneLevel); }, [ toneVisible ]);

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
    <FancyHeaderLayout
      title={t('nav.settings')}
      expandedPct={0.10}
      collapsedPct={0.10}
      scrollDistance={1}
    >
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

        {/* TODO: Re-enable theme selection dialog when theme UX is finalized. */}

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

      {/* TODO: Re-enable theme selector entry once theme selection is implemented again. */}

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
        {!hasNotificationPermission && (
          <Button
            mode="contained"
            style={{ alignSelf: 'flex-start' }}
            onPress={async () => {
              const ok = await ensureNotificationPermission();
              if (!ok) return;

              await configureAndroidChannel();
              setHasNotificationPermission(true);
            }}
          >
            {t('settings.enable_notifications')}
          </Button>
        )}
      </List.Section>

      {/* Legal / Play Store */}
      <List.Section>
        <List.Subheader>{t('settings.legal_section')}</List.Subheader>
        <List.Item
          title={t('settings.privacy_policy')}
          description={t('settings.privacy_policy_hint')}
          onPress={() => openExternal(LEGAL_LINKS.privacyPolicy)}
        />
        <List.Item
          title={t('settings.data_deletion')}
          description={t('settings.data_deletion_hint')}
          onPress={() => openExternal(LEGAL_LINKS.dataDeletion)}
        />
        <List.Item
          title={t('settings.terms_of_service')}
          description={t('settings.terms_of_service_hint')}
          onPress={() => openExternal(LEGAL_LINKS.termsOfService)}
        />
        <List.Item
          title={t('settings.support')}
          description={t('settings.support_hint')}
          onPress={() => openExternal(LEGAL_LINKS.support)}
        />
      </List.Section>
    </FancyHeaderLayout>
  );
}
