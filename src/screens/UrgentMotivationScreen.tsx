import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Card, Dialog, IconButton, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { t } from '../i18n';
import { useMotivationStore, MotivationItem } from '../store/motivation.store';
import MotivationPlayer from '../ui/components/MotivationPlayer';

export default function UrgentMotivationScreen({ navigation }: any) {
  const { items, hydrated, hydrate, removeItem, getRandomItem, updateTitle } = useMotivationStore();
  const [filter, setFilter] = useState<'all' | 'videos' | 'images' | 'audio'>('all');
  const [current, setCurrent] = useState<MotivationItem | null>(null);

  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  useEffect(() => { hydrate(); }, [hydrate]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'images') return items.filter((i) => i.kind === 'image');
    if (filter === 'audio') return items.filter((i) => i.kind === 'audio');
    return items.filter((i) => i.kind === 'youtube' || i.kind === 'tiktok');
  }, [items, filter]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text variant="titleLarge" style={{ flex: 1 }}>{t('motivation.title')}</Text>
              <Button mode="outlined" icon="plus" onPress={() => navigation.navigate('AddMotivationItem')}>
                {t('motivation.add')}
              </Button>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <Button mode="contained-tonal" icon="shuffle" onPress={() => {
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
                { value: 'all', label: 'All' },
                { value: 'videos', label: 'Videos' },
                { value: 'images', label: 'Images' },
                { value: 'audio', label: 'Audio' },
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
          </View>
        }
        data={filtered}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={hydrated ? <Text>{t('motivation.empty')}</Text> : <Text>{t('common.loading')}</Text>}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12, borderRadius: 6 }} onPress={() => setCurrent(item)}>
            <Card.Title
              title={<Text onPress={() => startEdit(item)}>{item.title || item.url}</Text>}
              subtitle={item.kind.toUpperCase()}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton icon="pencil" onPress={() => startEdit(item)} />
                  <IconButton icon="delete-outline" onPress={() => removeItem(item.id)} />
                </View>
              )}
            />
            <Card.Actions>
              <Button onPress={() => setCurrent(item)}>{t('motivation.open')}</Button>
            </Card.Actions>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={editVisible} onDismiss={() => setEditVisible(false)} style={{ borderRadius: 20 }}>
          <Dialog.Title>{t('motivation.edit_title') || 'Edit title'}</Dialog.Title>
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
      </Portal>
    </View>
  );
}