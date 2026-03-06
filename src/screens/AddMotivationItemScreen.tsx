import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Chip, HelperText, TextInput, useTheme } from 'react-native-paper';

import { t } from '../i18n';
import { useMotivationStore } from '../store/motivation.store';
import { detectMotivationKind } from '../utils/motivation';
import FancyHeaderBackLayout from '../ui/layouts/FancyHeaderBackLayout';
import { AppTheme } from '../ui/theme';
import { glassPanel, withAlpha } from '../ui/glass';

export default function AddMotivationItemScreen({ navigation }: any) {
  const { addItem } = useMotivationStore();
  const theme = useTheme() as AppTheme;

  const [ url, setUrl ] = useState('');
  const [ title, setTitle ] = useState('');
  const [ error, setError ] = useState('');

  const detected = useMemo(() => detectMotivationKind(url) || undefined, [ url ]);

  async function onSave() {
    setError('');
    if (!url.trim()) {
      setError(`${t('motivation.url')} ${t('add_habit.validation')}`);
      return;
    }

    const created = await addItem({ url, title, kind: detected });
    if (!created) {
      setError(t('motivation.unsupported_url'));
      return;
    }

    navigation.goBack();
  }

  return (
    <View style={{ flex: 1 }}>
      <FancyHeaderBackLayout title={t('motivation.add')} onBack={() => navigation.goBack()}>
        <View
          style={{
            ...glassPanel(theme, 'soft'),
            padding: 12,
            backgroundColor: theme.colors.elevation.level2,
          }}
        >
          <TextInput
            mode="outlined"
            label={t('motivation.url')}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ backgroundColor: 'transparent' }}
          />

          <TextInput
            style={{ marginTop: 12, backgroundColor: 'transparent' }}
            mode="outlined"
            label={t('motivation.title_optional')}
            value={title}
            onChangeText={setTitle}
          />

          {detected && (
            <Chip style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: withAlpha(theme.colors.primaryContainer, 0.7) }} icon="check">
              {t('motivation.detected_kind', { kind: t(`motivation.kind.${detected}`) })}
            </Chip>
          )}

          {!!error && <HelperText type="error">{error}</HelperText>}

          <Button style={{ marginTop: 16, borderRadius: 14 }} mode="contained" onPress={onSave}>
            {t('motivation.save')}
          </Button>
        </View>
      </FancyHeaderBackLayout>
    </View>
  );
}
