import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { FeedItem } from './data';

export function Feed({ items }: { items: FeedItem[] }) {
  // The selected ids live here, not in the rows: FlashList reuses a row's
  // component for another item when the row scrolls out of view, so a row
  // gets whether it is selected from its props.
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <FlashList
      testID="feed"
      data={items}
      keyExtractor={(item) => item.id}
      getItemType={(item) => item.kind}
      // renderItem reads `selected`, which is not part of `data`, so the list
      // gets it as extraData and renders its rows again when it changes.
      extraData={selected}
      renderItem={({ item }) =>
        item.kind === 'header' ? (
          <Text style={styles.header} accessibilityRole="header">
            {item.title}
          </Text>
        ) : (
          <Row item={item} selected={selected.has(item.id)} onPress={toggle} />
        )
      }
    />
  );
}

type RowProps = { item: FeedItem; selected: boolean; onPress: (id: string) => void };

function Row({ item, selected, onPress }: RowProps) {
  return (
    <Pressable
      style={[styles.row, selected && styles.selectedRow]}
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.title, selected && styles.selectedTitle]}>{item.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#f4f4f5',
    color: '#555',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedRow: { backgroundColor: '#e6f0ff' },
  title: { fontSize: 16 },
  selectedTitle: { color: '#0b57d0', fontWeight: '600' },
});
