import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

export type Item = { id: string; name: string };

export function SearchableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const matches = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        accessibilityLabel="Search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.row}>{item.name}</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No matches</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 16,
  },
  empty: { padding: 16, color: '#666', fontSize: 16 },
});
