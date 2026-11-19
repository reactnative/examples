import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { items } from '../../src/items';

export default function ItemScreen() {
  // The [id] segment of the URL: "3" for /item/3.
  const { id } = useLocalSearchParams<{ id: string }>();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No item has the id {id}.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {items[index].title}
      </Text>
      <Text style={styles.text}>
        Item {index + 1} of {items.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  text: { fontSize: 17, color: '#555' },
});
