import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Menu, Text, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';
import { AppTheme } from '../ui/theme';
import { glassPanel, withAlpha } from '../ui/glass';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme() as AppTheme;
  const { toneLevel, setToneLevel, setHasSeenWelcome, locale, setLocale } = useSettingsStore();
  const [ languageMenuVisible, setLanguageMenuVisible ] = useState(false);

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

      <View
        style={{
          ...glassPanel(theme, 'strong'),
          backgroundColor: theme.colors.elevation.level3,
          padding: 22,
          borderRadius: 26,
        }}
      >
        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Text style={[ styles.subtitle, { color: theme.colors.onSurfaceVariant } ]}>{t('welcome.subtitle')}</Text>

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
          style={{
            ...glassPanel(theme, 'soft'),
            backgroundColor: theme.colors.elevation.level1,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 16,
            marginBottom: 18,
          }}
        >
          <Text style={styles.exampleLabel}>{t('welcome.examples_label')}</Text>
          <Text style={styles.exampleText}>{t(`welcome.examples.level${toneLevel}`)}</Text>
        </View>

        <Button mode="contained" onPress={handleContinue} style={{ borderRadius: 14 }}>
          {t('welcome.continue')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 17,
    marginBottom: 8,
    fontWeight: '700',
  },
  slider: {
    marginBottom: 14,
  },
  levels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  levelText: {
    fontSize: 13,
    textAlign: 'center',
    flex: 1,
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
    marginBottom: 4,
    fontStyle: 'italic',
  },
});
