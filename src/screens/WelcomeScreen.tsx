import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { t } from '../i18n';
import { useSettingsStore } from '../store/settings.store';

export default function WelcomeScreen() {
  const navigation = useNavigation(); const theme = useTheme(); const { toneLevel, setToneLevel, setHasSeenWelcome, locale, setLocale } = useSettingsStore();
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
              mode="contained"
              onPress={() => setLanguageMenuVisible(true)}
              style={styles.languageButton}
              labelStyle={styles.languageButtonLabel}
            >
              {t(`language.${locale}`)}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setLocale('en'); setLanguageMenuVisible(false); }} title={t('language.en')} />
          <Menu.Item onPress={() => { setLocale('es'); setLanguageMenuVisible(false); }} title={t('language.es')} />
        </Menu>
      </View>

      <Text style={styles.title}>{t('welcome.title')}</Text>
      <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

      <Text style={styles.label}>{t('settings.tone_level')}</Text>
      <Slider
        value={toneLevel}
        onValueChange={(value: number) => setToneLevel(value as 0 | 1 | 2 | 3)}
        minimumValue={0}
        maximumValue={3}
        step={1}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor="#cccccc"
        thumbTintColor={theme.colors.primary}
        style={styles.slider}
      />
      <View style={styles.levels}>
        <Text style={styles.levelText}>{t('tone.level0')}</Text>
        <Text style={styles.levelText}>{t('tone.level1')}</Text>
        <Text style={styles.levelText}>{t('tone.level2')}</Text>
        <Text style={styles.levelText}>{t('tone.level3')}</Text>
      </View>

      <View style={styles.examples}>
        <Text style={styles.exampleLabel}>{t('welcome.examples_label')}</Text>
        <Text style={styles.exampleText}>{t(`welcome.examples.level${toneLevel}`)}</Text>
      </View>

      <Button mode="contained" onPress={handleContinue} style={styles.button}>
        {t('welcome.continue')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  languageButton: {
    // pequeño
  },
  languageButtonLabel: {
    fontSize: 12,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  slider: {
    marginBottom: 20,
  },
  levels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
  examples: {
    marginBottom: 40,
  },
  exampleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 20,
  },
});