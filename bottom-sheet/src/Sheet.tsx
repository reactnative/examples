import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

// The heights the sheet stops at, as a share of the screen: index 0 is 25%,
// index 1 is 50%.
const snapPoints = ['25%', '50%'];

export function Sheet() {
  const sheetRef = useRef<BottomSheet>(null);
  // The index of the snap point the sheet is at. It starts at 0, the
  // sheet's default index.
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Position: {snapPoints[index]}</Text>
      <Button title="Expand to 50%" onPress={() => sheetRef.current?.snapToIndex(1)} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        // Dynamic sizing is on by default in version 5. Off, the sheet
        // stops only at the snap points.
        enableDynamicSizing={false}
        onChange={(next) => setIndex(next)}
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Bottom sheet</Text>
          <Text style={styles.text}>This text is the sheet's content.</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12, backgroundColor: '#eef0f3' },
  label: { fontSize: 17 },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  text: { fontSize: 17, color: '#555' },
});
