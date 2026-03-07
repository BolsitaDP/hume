import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { getMotivationMessagePreview } from '../services/rageMessages';
import { AppTheme } from '../ui/theme';
import { withAlpha } from '../ui/glass';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme() as AppTheme;
  const {
    toneLevel,
    setToneLevel,
    motivationStyle,
    customMessageRules,
    setMotivationStyle,
    setHasSeenWelcome,
    locale,
    setLocale,
  } = useSettingsStore();
  const [ languageMenuVisible, setLanguageMenuVisible ] = useState(false);

  const tonePreview = useMemo(
    () => getMotivationMessagePreview(locale, toneLevel, motivationStyle, 'exercise', customMessageRules),
    [ locale, toneLevel, motivationStyle, customMessageRules ]
  );

  const motivationOptions = useMemo(
    () => [
      {
        key: 'positive' as const,
        icon: 'emoticon-happy-outline',
        title: t('welcome.motivation.positive.title'),
        description: t('welcome.motivation.positive.description'),
        example: t('welcome.motivation.positive.example'),
      },
      {
        key: 'negative' as const,
        icon: 'alert-outline',
        title: t('welcome.motivation.negative.title'),
        description: t('welcome.motivation.negative.description'),
        example: t('welcome.motivation.negative.example'),
      },
    ],
    [ locale ]
  );

  const handleContinue = async () => {
    await setHasSeenWelcome(true);
    navigation.navigate('Tabs' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Menu
          visible={languageMenuVisible}
          onDismiss={() => setLanguageMenuVisible(false)}
          anchor={
            <Button
              icon="translate"
              mode="contained-tonal"
              onPress={() => setLanguageMenuVisible(true)}
              style={{ borderRadius: 999 }}
            >
              {t(`language.${locale}`)}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setLocale('en'); setLanguageMenuVisible(false); }} title={t('language.en')} />
          <Menu.Item onPress={() => { setLocale('es'); setLanguageMenuVisible(false); }} title={t('language.es')} />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.elevation.level3,
              borderColor: withAlpha(theme.colors.outlineVariant, 0.72),
            },
          ]}
        >
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={[ styles.subtitle, { color: theme.colors.onSurfaceVariant } ]}>{t('welcome.subtitle')}</Text>

          <Text style={styles.label}>{t('welcome.motivation.title')}</Text>
          <Text style={[ styles.helper, { color: theme.colors.onSurfaceVariant } ]}>{t('welcome.motivation.subtitle')}</Text>

          <View style={styles.motivationContainer}>
            {motivationOptions.map((option) => {
              const isSelected = motivationStyle === option.key;
              return (
                <TouchableRipple
                  key={option.key}
                  onPress={() => setMotivationStyle(option.key)}
                  borderless={false}
                  style={{ borderRadius: 14 }}
                >
                  <View
                    style={[
                      styles.motivationCard,
                      {
                        backgroundColor: isSelected
                          ? withAlpha(theme.colors.primaryContainer, theme.dark ? 0.8 : 0.9)
                          : theme.colors.elevation.level2,
                        borderColor: isSelected
                          ? withAlpha(theme.colors.primary, theme.dark ? 0.72 : 0.52)
                          : withAlpha(theme.colors.outlineVariant, 0.74),
                      },
                    ]}
                  >
                    <View style={styles.motivationHeader}>
                      <MaterialCommunityIcons
                        name={option.icon as any}
                        size={20}
                        color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                      />
                      <Text
                        variant="titleSmall"
                        style={{
                          marginLeft: 8,
                          color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                          fontWeight: '700',
                        }}
                      >
                        {option.title}
                      </Text>
                    </View>

                    <Text style={[ styles.motivationDesc, { color: theme.colors.onSurfaceVariant } ]}>
                      {option.description}
                    </Text>
                    <Text style={[ styles.motivationExample, { color: theme.colors.onSurface } ]}>
                      {option.example}
                    </Text>
                  </View>
                </TouchableRipple>
              );
            })}
          </View>

          <Text style={styles.label}>{t('settings.tone_level')}</Text>
          <Slider
            value={toneLevel}
            onValueChange={(value: number) => setToneLevel(value as 0 | 1 | 2 | 3)}
            minimumValue={0}
            maximumValue={3}
            step={1}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={withAlpha(theme.colors.onSurfaceVariant, 0.3)}
            thumbTintColor={theme.colors.primary}
            style={styles.slider}
          />

          <View style={styles.levels}>
            <Text style={styles.levelText}>{t('tone.level0')}</Text>
            <Text style={styles.levelText}>{t('tone.level1')}</Text>
            <Text style={styles.levelText}>{t('tone.level2')}</Text>
            <Text style={styles.levelText}>{t('tone.level3')}</Text>
          </View>

          <View
            style={[
              styles.exampleBox,
              {
                backgroundColor: theme.colors.elevation.level1,
                borderColor: withAlpha(theme.colors.outlineVariant, 0.68),
              },
            ]}
          >
            <Text style={styles.exampleLabel}>{t('welcome.examples_label')}</Text>
            <Text style={styles.exampleText}>{`"${tonePreview}"`}</Text>
          </View>

          <Button mode="contained" onPress={handleContinue} style={{ borderRadius: 14 }}>
            {t('welcome.continue')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 22,
  },
  panel: {
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '700',
  },
  helper: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  motivationContainer: {
    gap: 10,
    marginBottom: 18,
  },
  motivationCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  motivationDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  motivationExample: {
    marginTop: 6,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  slider: {
    marginBottom: 14,
  },
  levels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  exampleBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
    fontStyle: 'italic',
  },
});
