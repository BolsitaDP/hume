import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  Button,
  Checkbox,
  Dialog,
  IconButton,
  List,
  Portal,
  RadioButton,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';

import FancyHeaderLayout from '../ui/layouts/FancyHeaderLayout';
import { t } from '../i18n';
import { useSettingsStore, type CustomMessageRule, type MotivationStyle, type ToneLevel } from '../store/settings.store';
import { configureAndroidChannel, ensureNotificationPermission } from '../services/notifications';
import { pickMotivationMessage } from '../services/rageMessages';
import { AppTheme } from '../ui/theme';
import { glassPanel, withAlpha } from '../ui/glass';
import type { HabitCategory } from '../store/habits.store';

const LEGAL_LINKS = {
  privacyPolicy: 'https://bolsitadp.github.io/hume/privacy.html',
  termsOfService: 'https://bolsitadp.github.io/hume/terms.html',
  dataDeletion: 'https://bolsitadp.github.io/hume/data-deletion.html',
  support: 'mailto:sgiraldo118@gmail.com',
};

const ALL_STYLES: MotivationStyle[] = [ 'positive', 'negative' ];
const ALL_TONES: ToneLevel[] = [ 0, 1, 2, 3 ];
const ALL_CATEGORIES: HabitCategory[] = [ 'study', 'exercise', 'health', 'work', 'personal', 'discipline' ];

function toggleItem<T extends string | number>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [ ...arr, value ];
}

function buildRuleScope(rule: CustomMessageRule) {
  const styles = rule.styles.map((s) => t(`welcome.motivation.${s}.title`)).join(', ');
  const tones = rule.tones.map((tone) => t(`tone.level${tone}`)).join(', ');
  const categories = rule.categories.map((cat) => t(`categories.${cat}`)).join(', ');
  return `${styles} | ${tones} | ${categories}`;
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const {
    locale,
    setLocale,
    toneLevel,
    setToneLevel,
    motivationStyle,
    setMotivationStyle,
    customMessageRules,
    addCustomMessageRule,
    updateCustomMessageRule,
    removeCustomMessageRule,
    toggleCustomMessageRule,
  } = useSettingsStore();
  const theme = useTheme() as AppTheme;

  const [ langVisible, setLangVisible ] = useState(false);
  const [ toneVisible, setToneVisible ] = useState(false);
  const [ motivationVisible, setMotivationVisible ] = useState(false);
  const [ messageTestVisible, setMessageTestVisible ] = useState(false);
  const [ customMessagesVisible, setCustomMessagesVisible ] = useState(false);
  const [ customEditorVisible, setCustomEditorVisible ] = useState(false);

  const [ tmpLocale, setTmpLocale ] = useState(locale);
  const [ tmpTone, setTmpTone ] = useState<ToneLevel>(toneLevel);
  const [ tmpMotivationStyle, setTmpMotivationStyle ] = useState<MotivationStyle>(motivationStyle);

  const [ testCategory, setTestCategory ] = useState<HabitCategory>('exercise');
  const [ testMessage, setTestMessage ] = useState('');

  const [ editRuleId, setEditRuleId ] = useState<string | null>(null);
  const [ editorText, setEditorText ] = useState('');
  const [ editorStyles, setEditorStyles ] = useState<MotivationStyle[]>([ 'negative' ]);
  const [ editorTones, setEditorTones ] = useState<ToneLevel[]>([ toneLevel ]);
  const [ editorCategories, setEditorCategories ] = useState<HabitCategory[]>([ 'exercise' ]);
  const [ editorError, setEditorError ] = useState('');

  const [ hasNotificationPermission, setHasNotificationPermission ] = useState(true);

  useEffect(() => {
    if (langVisible) setTmpLocale(locale);
  }, [ langVisible, locale ]);

  useEffect(() => {
    if (toneVisible) setTmpTone(toneLevel);
  }, [ toneVisible, toneLevel ]);

  useEffect(() => {
    if (motivationVisible) setTmpMotivationStyle(motivationStyle);
  }, [ motivationVisible, motivationStyle ]);

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

  const openOnboardingForTesting = () => {
    const parent = navigation.getParent?.();
    if (parent?.navigate) {
      parent.navigate('Welcome');
      return;
    }
    navigation.navigate('Welcome');
  };

  const generateTestMessage = () => {
    setTestMessage(pickMotivationMessage(locale, toneLevel, motivationStyle, testCategory, customMessageRules));
  };

  const resetCustomEditor = () => {
    setEditRuleId(null);
    setEditorText('');
    setEditorStyles([ 'negative' ]);
    setEditorTones([ toneLevel ]);
    setEditorCategories([ 'exercise' ]);
    setEditorError('');
  };

  const openCreateCustomRule = () => {
    resetCustomEditor();
    setCustomEditorVisible(true);
  };

  const openEditCustomRule = (rule: CustomMessageRule) => {
    setEditRuleId(rule.id);
    setEditorText(rule.text);
    setEditorStyles(rule.styles);
    setEditorTones(rule.tones);
    setEditorCategories(rule.categories);
    setEditorError('');
    setCustomEditorVisible(true);
  };

  const saveCustomRule = async () => {
    const trimmed = editorText.trim();
    if (!trimmed || !editorStyles.length || !editorTones.length || !editorCategories.length) {
      setEditorError(t('settings.custom_messages_required'));
      return;
    }

    if (editRuleId) {
      const current = customMessageRules.find((x) => x.id === editRuleId);
      await updateCustomMessageRule(editRuleId, {
        text: trimmed,
        styles: editorStyles,
        tones: editorTones,
        categories: editorCategories,
        enabled: current?.enabled,
      });
    } else {
      await addCustomMessageRule({
        text: trimmed,
        styles: editorStyles,
        tones: editorTones,
        categories: editorCategories,
      });
    }

    setCustomEditorVisible(false);
    resetCustomEditor();
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
          visible={motivationVisible}
          onDismiss={() => setMotivationVisible(false)}
          style={{
            ...glassPanel(theme, 'strong'),
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <Dialog.Title>{t('welcome.motivation.title')}</Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            >
              {t('welcome.motivation.subtitle')}
            </Text>

            <RadioButton.Group onValueChange={(v) => setTmpMotivationStyle(v as MotivationStyle)} value={tmpMotivationStyle}>
              <RadioButton.Item label={t('welcome.motivation.positive.title')} value="positive" />
              <RadioButton.Item label={t('welcome.motivation.negative.title')} value="negative" />
            </RadioButton.Group>

            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {tmpMotivationStyle === 'positive'
                ? t('welcome.motivation.positive.example')
                : t('welcome.motivation.negative.example')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMotivationVisible(false)}>{t('common.cancel')}</Button>
            <Button
              onPress={async () => {
                await setMotivationStyle(tmpMotivationStyle);
                setMotivationVisible(false);
              }}
            >
              {t('common.ok')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={messageTestVisible}
          onDismiss={() => setMessageTestVisible(false)}
          style={{
            ...glassPanel(theme, 'strong'),
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <Dialog.Title>{t('settings.test_message_title')}</Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            >
              {t('settings.test_message_hint')}
            </Text>

            <Text
              variant="bodySmall"
              style={{ color: withAlpha(theme.colors.onSurfaceVariant, 0.95), marginBottom: 6 }}
            >
              {`${t('welcome.motivation.title')}: ${t(`welcome.motivation.${motivationStyle}.title`)}`}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: withAlpha(theme.colors.onSurfaceVariant, 0.95), marginBottom: 10 }}
            >
              {`${t('settings.tone_level')}: ${t(`tone.level${toneLevel}`)}`}
            </Text>

            <RadioButton.Group onValueChange={(v) => setTestCategory(v as HabitCategory)} value={testCategory}>
              <RadioButton.Item label={t('categories.study')} value="study" />
              <RadioButton.Item label={t('categories.exercise')} value="exercise" />
              <RadioButton.Item label={t('categories.health')} value="health" />
              <RadioButton.Item label={t('categories.work')} value="work" />
              <RadioButton.Item label={t('categories.personal')} value="personal" />
              <RadioButton.Item label={t('categories.discipline')} value="discipline" />
            </RadioButton.Group>

            <View
              style={{
                ...glassPanel(theme, 'soft'),
                backgroundColor: theme.colors.elevation.level1,
                borderColor: withAlpha(theme.colors.outlineVariant, 0.7),
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginTop: 10,
              }}
            >
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>
                {t('settings.test_message_preview_label')}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {testMessage || t('settings.test_message_empty')}
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setMessageTestVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={generateTestMessage}>{t('settings.test_message_generate')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={customMessagesVisible}
          onDismiss={() => setCustomMessagesVisible(false)}
          style={{
            ...glassPanel(theme, 'strong'),
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <Dialog.Title>{t('settings.custom_messages')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 10 }}>
              {t('settings.custom_messages_hint')}
            </Text>

            <Button mode="contained-tonal" icon="plus" onPress={openCreateCustomRule} style={{ borderRadius: 10, marginBottom: 10 }}>
              {t('settings.custom_messages_add')}
            </Button>

            {customMessageRules.length === 0 ? (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('settings.custom_messages_empty')}</Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {customMessageRules.map((rule) => (
                  <View
                    key={rule.id}
                    style={{
                      ...glassPanel(theme, 'soft'),
                      backgroundColor: theme.colors.elevation.level1,
                      borderColor: withAlpha(theme.colors.outlineVariant, 0.72),
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: theme.colors.onSurface, fontWeight: '700' }} numberOfLines={2}>
                      {rule.text}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }} numberOfLines={3}>
                      {buildRuleScope(rule)}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Switch
                        value={rule.enabled}
                        onValueChange={(next) => {
                          toggleCustomMessageRule(rule.id, next).catch(() => {
                            // no-op
                          });
                        }}
                      />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
                        {rule.enabled ? t('settings.custom_messages_enabled') : t('settings.custom_messages_disabled')}
                      </Text>

                      <View style={{ flex: 1 }} />

                      <IconButton icon="pencil-outline" size={20} onPress={() => openEditCustomRule(rule)} />
                      <IconButton
                        icon="delete-outline"
                        size={20}
                        onPress={() => {
                          removeCustomMessageRule(rule.id).catch(() => {
                            // no-op
                          });
                        }}
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCustomMessagesVisible(false)}>{t('common.ok')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={customEditorVisible}
          onDismiss={() => setCustomEditorVisible(false)}
          style={{
            ...glassPanel(theme, 'strong'),
            backgroundColor: theme.colors.elevation.level3,
          }}
        >
          <Dialog.Title>{editRuleId ? t('settings.custom_messages_edit') : t('settings.custom_messages_new')}</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 420 }}>
              <TextInput
                mode="outlined"
                label={t('settings.custom_messages_text_label')}
                value={editorText}
                onChangeText={setEditorText}
                multiline
                style={{ marginBottom: 10 }}
              />

              <Text style={{ fontWeight: '700', marginBottom: 4 }}>{t('settings.custom_messages_styles')}</Text>
              {ALL_STYLES.map((style) => (
                <Checkbox.Item
                  key={style}
                  label={t(`welcome.motivation.${style}.title`)}
                  status={editorStyles.includes(style) ? 'checked' : 'unchecked'}
                  onPress={() => setEditorStyles((prev) => toggleItem(prev, style))}
                />
              ))}

              <Text style={{ fontWeight: '700', marginBottom: 4, marginTop: 6 }}>{t('settings.custom_messages_tones')}</Text>
              {ALL_TONES.map((tone) => (
                <Checkbox.Item
                  key={tone}
                  label={t(`tone.level${tone}`)}
                  status={editorTones.includes(tone) ? 'checked' : 'unchecked'}
                  onPress={() => setEditorTones((prev) => toggleItem(prev, tone))}
                />
              ))}

              <Text style={{ fontWeight: '700', marginBottom: 4, marginTop: 6 }}>{t('settings.custom_messages_categories')}</Text>
              {ALL_CATEGORIES.map((cat) => (
                <Checkbox.Item
                  key={cat}
                  label={t(`categories.${cat}`)}
                  status={editorCategories.includes(cat) ? 'checked' : 'unchecked'}
                  onPress={() => setEditorCategories((prev) => toggleItem(prev, cat))}
                />
              ))}

              {editorError ? (
                <Text style={{ color: theme.colors.error, marginTop: 4 }}>{editorError}</Text>
              ) : null}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setCustomEditorVisible(false);
                resetCustomEditor();
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onPress={saveCustomRule}>{t('settings.custom_messages_save')}</Button>
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
            <RadioButton.Group onValueChange={(v) => setTmpTone(Number(v) as ToneLevel)} value={tmpTone as any}>
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
            title={t('welcome.motivation.title')}
            description={t(`welcome.motivation.${motivationStyle}.title`)}
            onPress={() => setMotivationVisible(true)}
            left={(props) => <List.Icon {...props} icon="brain" />}
          />

          <List.Item
            title={t('settings.tone_level')}
            description={t(`tone.level${toneLevel}`)}
            onPress={() => setToneVisible(true)}
            left={(props) => <List.Icon {...props} icon="volume-high" />}
          />

          <List.Item
            title={t('settings.custom_messages')}
            description={t('settings.custom_messages_count', { count: customMessageRules.length })}
            onPress={() => setCustomMessagesVisible(true)}
            left={(props) => <List.Icon {...props} icon="playlist-edit" />}
          />

          <List.Item
            title={t('settings.test_message_title')}
            description={t('settings.test_message_item_hint')}
            onPress={() => {
              setTestCategory('exercise');
              setTestMessage(pickMotivationMessage(locale, toneLevel, motivationStyle, 'exercise', customMessageRules));
              setMessageTestVisible(true);
            }}
            left={(props) => <List.Icon {...props} icon="message-text-outline" />}
          />

          <List.Item
            title={t('settings.open_onboarding_test')}
            description={t('settings.open_onboarding_test_hint')}
            onPress={openOnboardingForTesting}
            left={(props) => <List.Icon {...props} icon="flask-outline" />}
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
