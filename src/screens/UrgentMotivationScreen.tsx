import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  IconButton,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { t } from '../i18n';
import { MotivationItem, useMotivationStore } from '../store/motivation.store';
import MotivationPlayer from '../ui/components/MotivationPlayer';
import FancyHeaderBackLayout from '../ui/layouts/FancyHeaderBackLayout';
import { AppTheme } from '../ui/theme';
import { withAlpha } from '../ui/glass';

export default function UrgentMotivationScreen({ navigation }: any) {
  const theme = useTheme() as AppTheme;
  const { items, hydrated, hydrate, removeItem, getRandomItem, updateTitle } = useMotivationStore();

  const [ filter, setFilter ] = useState<'all' | 'videos' | 'images' | 'audio'>('all');
  const [ current, setCurrent ] = useState<MotivationItem | null>(null);
  const [ editVisible, setEditVisible ] = useState(false);
  const [ editId, setEditId ] = useState<string | null>(null);
  const [ editValue, setEditValue ] = useState('');
  const [ infoVisible, setInfoVisible ] = useState(false);
  const [ confirmVisible, setConfirmVisible ] = useState(false);
  const [ confirmId, setConfirmId ] = useState<string | null>(null);

  function isVideoKind(item: MotivationItem) {
    return item.kind === 'youtube' || item.kind === 'tiktok' || item.kind === 'instagram';
  }

  function getKindIcon(item: MotivationItem) {
    if (isVideoKind(item)) return 'play-circle-outline';
    if (item.kind === 'audio') return 'music-note-outline';
    return 'image-outline';
  }

  function renderItemThumb(item: MotivationItem) {
    if (item.thumbnailUrl) {
      return (
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumb}
          resizeMode="cover"
        />
      );
    }

    return (
      <Avatar.Icon
        size={44}
        icon={getKindIcon(item)}
        style={{ backgroundColor: withAlpha(theme.colors.primary, theme.dark ? 0.3 : 0.16) }}
      />
    );
  }

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
      if (current?.id === confirmId) setCurrent(null);
    }
    setConfirmVisible(false);
    setConfirmId(null);
  }

  useEffect(() => {
    hydrate();
  }, [ hydrate ]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'images') return items.filter((i) => i.kind === 'image');
    if (filter === 'audio') return items.filter((i) => i.kind === 'audio');
    return items.filter((i) => i.kind === 'youtube' || i.kind === 'tiktok' || i.kind === 'instagram');
  }, [ items, filter ]);

  const selectedSegmentStyle = {
    backgroundColor: withAlpha(theme.colors.primaryContainer, theme.dark ? 0.9 : 0.92),
    borderColor: withAlpha(theme.colors.primary, theme.dark ? 0.52 : 0.38),
  };

  return (
    <View style={{ flex: 1 }}>
      <FancyHeaderBackLayout title={t('motivation.title')} onBack={() => navigation.goBack()}>
        <View style={styles.actionsRow}>
          <Button
            mode="contained"
            icon="plus"
            style={styles.primaryAction}
            onPress={() => navigation.navigate('AddMotivationItem')}
          >
            {t('motivation.add')}
          </Button>

          <Button
            mode="contained-tonal"
            icon="shuffle"
            style={styles.secondaryAction}
            onPress={() => {
              const pick = getRandomItem();
              if (pick) setCurrent(pick);
            }}
          >
            {t('motivation.random')}
          </Button>

          <IconButton
            icon="information-outline"
            mode="contained-tonal"
            onPress={() => setInfoVisible(true)}
          />
        </View>

        <SegmentedButtons
          style={styles.segmented}
          value={filter}
          onValueChange={(v) => setFilter(v as 'all' | 'videos' | 'images' | 'audio')}
          buttons={[
            {
              value: 'all',
              label: t('motivation.filters.all'),
              style: filter === 'all' ? selectedSegmentStyle : undefined,
            },
            {
              value: 'videos',
              label: t('motivation.filters.videos'),
              style: filter === 'videos' ? selectedSegmentStyle : undefined,
            },
            {
              value: 'images',
              label: t('motivation.filters.images'),
              style: filter === 'images' ? selectedSegmentStyle : undefined,
            },
            {
              value: 'audio',
              label: t('motivation.filters.audio'),
              style: filter === 'audio' ? selectedSegmentStyle : undefined,
            },
          ]}
        />

        {current ? (
          <Card
            mode="elevated"
            style={[
              styles.currentCard,
              { backgroundColor: theme.colors.elevation.level2 },
            ]}
          >
            <Card.Title
              left={() => renderItemThumb(current)}
              title={current.title || current.url}
              titleNumberOfLines={2}
              subtitle={current.kind.toUpperCase()}
              right={() => (
                <View style={styles.currentCardRight}>
                  <IconButton icon="pencil-outline" onPress={() => startEdit(current)} />
                  <IconButton icon="close" onPress={() => setCurrent(null)} />
                </View>
              )}
            />
            <Card.Content style={styles.currentCardContent}>
              <MotivationPlayer item={current} />
            </Card.Content>
          </Card>
        ) : null}

        {!hydrated ? (
          <Card mode="outlined" style={[ styles.stateCard, { borderColor: theme.colors.outlineVariant } ]}>
            <Card.Content style={styles.stateCardContent}>
              <ActivityIndicator animating />
              <Text style={{ marginTop: 8 }}>{t('common.loading')}</Text>
            </Card.Content>
          </Card>
        ) : filtered.length === 0 ? (
          <Card mode="outlined" style={[ styles.stateCard, { borderColor: theme.colors.outlineVariant } ]}>
            <Card.Content style={styles.stateCardContent}>
              <Avatar.Icon size={44} icon="inbox-outline" />
              <Text style={{ marginTop: 8, textAlign: 'center' }}>{t('motivation.empty')}</Text>
            </Card.Content>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              mode="outlined"
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.colors.elevation.level1,
                  borderColor: withAlpha(theme.colors.outlineVariant, 0.84),
                },
              ]}
              onPress={() => setCurrent(item)}
            >
              <Card.Title
                left={() => renderItemThumb(item)}
                title={item.title || item.url}
                titleNumberOfLines={2}
                subtitle={item.url}
                subtitleNumberOfLines={1}
                right={() => (
                  <IconButton icon="pencil-outline" onPress={() => startEdit(item)} />
                )}
              />

              <Card.Content style={styles.itemMetaRow}>
                <Chip compact icon={getKindIcon(item)}>{item.kind.toUpperCase()}</Chip>
              </Card.Content>

              <Card.Actions>
                <Button
                  mode="text"
                  textColor={theme.colors.error}
                  onPress={() => confirmDelete(item.id)}
                >
                  {t('motivation.delete')}
                </Button>
                <View style={{ flex: 1 }} />
                <Button
                  mode="contained-tonal"
                  onPress={() => setCurrent(item)}
                >
                  {t('motivation.open')}
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </FancyHeaderBackLayout>

      <Portal>
        <Dialog
          visible={infoVisible}
          onDismiss={() => setInfoVisible(false)}
          style={[ styles.dialog, { backgroundColor: theme.colors.elevation.level3 } ]}
        >
          <Dialog.Title>{t('motivation.info_title')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('motivation.info_message')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInfoVisible(false)}>{t('common.cancel')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={editVisible}
          onDismiss={() => setEditVisible(false)}
          style={[ styles.dialog, { backgroundColor: theme.colors.elevation.level3 } ]}
        >
          <Dialog.Title>{t('motivation.edit_title')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label={t('motivation.title_optional')}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus
              style={{ backgroundColor: 'transparent' }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={commitEdit}>{t('motivation.save')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={confirmVisible}
          onDismiss={() => setConfirmVisible(false)}
          style={[ styles.dialog, { backgroundColor: theme.colors.elevation.level3 } ]}
        >
          <Dialog.Title>{t('motivation.delete')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('motivation.delete_confirm_message')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" buttonColor={theme.colors.error} textColor={theme.colors.onError} onPress={handleConfirmDelete}>
              {t('motivation.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  primaryAction: {
    borderRadius: 12,
  },
  secondaryAction: {
    borderRadius: 12,
  },
  segmented: {
    marginTop: 4,
    marginBottom: 10,
  },
  currentCard: {
    borderRadius: 18,
    marginBottom: 12,
  },
  currentCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCardContent: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  itemCard: {
    borderRadius: 16,
    marginBottom: 10,
  },
  itemMetaRow: {
    paddingTop: 2,
    paddingBottom: 0,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  stateCard: {
    borderRadius: 16,
    marginTop: 6,
  },
  stateCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  dialog: {
    borderRadius: 18,
  },
});
