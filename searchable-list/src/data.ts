import type { Item } from './SearchableList';

// Each id is the library's npm package name, so it is unique and stable.
// Ten items: FlatList renders its first 10 rows (`initialNumToRender`) before
// it is laid out, and Jest never lays it out, so the tests see every item.
export const libraries: Item[] = [
  { id: 'react-native-reanimated', name: 'Reanimated' },
  { id: 'react-native-gesture-handler', name: 'Gesture Handler' },
  { id: '@react-navigation/native', name: 'React Navigation' },
  { id: 'react-native-navigation', name: 'React Native Navigation' },
  { id: 'expo-router', name: 'Expo Router' },
  { id: '@shopify/flash-list', name: 'FlashList' },
  { id: 'react-native-screens', name: 'Screens' },
  { id: 'react-native-safe-area-context', name: 'Safe Area Context' },
  { id: 'react-native-svg', name: 'SVG' },
  { id: 'react-native-mmkv', name: 'MMKV' },
];
