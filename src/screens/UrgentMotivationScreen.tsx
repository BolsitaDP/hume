import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Dialog, IconButton, Portal, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';

import { t } from '../i18n';
import { useMotivationStore, MotivationItem } from '../store/motivation.store';
import MotivationPlayer from '../ui/components/MotivationPlayer';
import FancyHeaderBackLayout from '../ui/layouts/FancyHeaderBackLayout';

export default function UrgentMotivationScreen({ navigation }: any) {
  const theme = useTheme();
  const { items, hydrated, hydrate, removeItem, getRandomItem, updateTitle } = useMotivationStore();
  const [ filter, setFilter ] = useState<'all' | 'videos' | 'images' | 'audio'>('all');
  const [ current, setCurrent ] = useState<MotivationItem | null>(null);

  const [ editVisible, setEditVisible ] = useState(false);
  const [ editId, setEditId ] = useState<string | null>(null);
  const [ editValue, setEditValue ] = useState('');

  const [ confirmVisible, setConfirmVisible ] = useState(false);
  const [ confirmId, setConfirmId ] = useState<string | null>(null);

  function startEdit(item: MotivationItem) {
    setEditId(item.id);
    setEditValue(item.title || '');
    setEditVisible(true);
  }

  async function commitEdit() {
    if (!editId) return;
    await updateTitle(editId, editValue);
    setEditVisible(false);
    setEditId(null);
  }

  function confirmDelete(id: string) {
    setConfirmId(id);
    setConfirmVisible(true);
  }

  async function handleConfirmDelete() {
    if (confirmId) {
      await removeItem(confirmId);
    }
    setConfirmVisible(false);
    setConfirmId(null);
  }

  useEffect(() => { hydrate(); }, [ hydrate ]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'images') return items.filter((i) => i.kind === 'image');
    if (filter === 'audio') return items.filter((i) => i.kind === 'audio');
    return items.filter((i) => i.kind === 'youtube' || i.kind === 'tiktok');
  }, [ items, filter ]);

  return (
    <View style={{ flex: 1 }}>
      <FancyHeaderBackLayout title={t('motivation.title')} onBack={() => navigation.goBack()}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button mode="contained" icon="plus" buttonColor={theme.colors.primary} textColor={theme.colors.onPrimary} onPress={() => navigation.navigate('AddMotivationItem')}>
            {t('motivation.add')}
          </Button>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <Button mode="contained-tonal" icon="shuffle" buttonColor={(theme as any).colors.secondaryContainer} textColor={(theme as any).colors.onSecondaryContainer} onPress={() => {
            const pick = getRandomItem();
            if (pick) setCurrent(pick);
          }}>
            {t('motivation.random')}
          </Button>
        </View>

        <SegmentedButtons
          style={{ marginVertical: 8 }}
          value={filter}
          onValueChange={(v: any) => setFilter(v)}
          buttons={[
            { value: 'all', label: t('motivation.filters.all') },
            { value: 'videos', label: t('motivation.filters.videos') },
            { value: 'images', label: t('motivation.filters.images') },
            { value: 'audio', label: t('motivation.filters.audio') },
          ]}
        />

        {current && (
          <Card style={{ marginVertical: 12, borderRadius: 6 }}>
            <Card.Title
              title={<Text onPress={() => startEdit(current)}>{current.title || current.url}</Text>}
              subtitle={current.kind.toUpperCase()}
            />
            <Card.Content style={{ paddingTop: 12 }}>
              <MotivationPlayer item={current} />
            </Card.Content>
          </Card>
        )}

        {!hydrated ? <Text>{t('common.loading')}</Text> : filtered.length === 0 ? <Text>{t('motivation.empty')}</Text> : filtered.map((item) => (
          <Card key={item.id} style={{ marginBottom: 12, borderRadius: 6 }} onPress={() => setCurrent(item)}>
            <Card.Title
              title={<Text onPress={() => startEdit(item)}>{item.title || item.url}</Text>}
              subtitle={item.kind.toUpperCase()}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton icon="pencil" iconColor={(theme as any).colors.primary} onPress={() => startEdit(item)} />
                </View>
              )}
            />
            <Card.Actions>
              <Button
                mode="contained"
                icon="delete"
                buttonColor={theme.colors.error}
                textColor={theme.colors.onError}
                onPress={() => confirmDelete(item.id)}
              >
                {t('motivation.delete')}
              </Button>
              <View style={{ flex: 1 }} />
              <Button mode="contained-tonal" buttonColor={(theme as any).colors.secondaryContainer} textColor={(theme as any).colors.onSecondaryContainer} onPress={() => setCurrent(item)}>{t('motivation.open')}</Button>
            </Card.Actions>
          </Card>
        ))}
      </FancyHeaderBackLayout>

      <Portal>
        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)} style={{ borderRadius: 20 }}>
          <Dialog.Title>{t('motivation.edit_title')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label={t('motivation.title_optional')}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={commitEdit}>{t('motivation.save')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)} style={{ borderRadius: 20 }}>
          <Dialog.Title>{t('motivation.delete')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('motivation.delete_confirm_message')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" buttonColor={theme.colors.error} textColor={theme.colors.onError} onPress={handleConfirmDelete}>{t('motivation.delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}


