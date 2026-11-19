import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    // The tabs have no icons, so the tab bar hides the icon's place and shows
    // only the titles.
    <Tabs screenOptions={{ tabBarIconStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
