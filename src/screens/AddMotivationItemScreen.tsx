import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, Text, TextInput, Chip } from 'react-native-paper';

import { t } from '../i18n';
import { useMotivationStore } from '../store/motivation.store';
import { detectMotivationKind } from '../utils/motivation';

export default function AddMotivationItemScreen({ navigation }: any) {
  const { addItem } = useMotivationStore();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const detected = useMemo(() => detectMotivationKind(url) || undefined, [url]);

  async function onSave() {
    setError('');
    if (!url.trim()) {
      setError(t('motivation.url') + ' ' + t('add_habit.validation'));
      return;
    }
    const created = await addItem({ url, title, kind: detected });
    if (!created) {
      setError('Unsupported URL. Please specify a valid YouTube/TikTok/image/audio link.');
      return;
    }
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        mode="outlined"
        label={t('motivation.url')}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={{ marginTop: 12 }}
        mode="outlined"
        label={t('motivation.title_optional')}
        value={title}
        onChangeText={setTitle}
      />

      {detected && (
        <Chip style={{ marginTop: 12 }} icon="check">
          {t('motivation.detected_kind', { kind: t(`motivation.kind.${detected}`) })}
        </Chip>
      )}

      {!!error && <HelperText type="error">{error}</HelperText>}

      <Button style={{ marginTop: 16 }} mode="contained" onPress={onSave}>
        {t('motivation.save')}
      </Button>
    </View>
  );
}