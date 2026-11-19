import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { items } from '../../src/items';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={{ pathname: '/item/[id]', params: { id: item.id } }}
          style={styles.row}
        >
          {item.title}
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 17,
  },
});
