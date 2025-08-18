import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22d3ee', // cyan-400
        tabBarInactiveTintColor: '#94a3b8', // slate-400
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#0b1221',
          borderTopColor: '#131e33',
          // make space for the system nav/gesture area
          height: 54 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'index') {
            return <Ionicons name="grid-outline" size={size} color={color} />;
          }
          if (route.name === 'device') {
            return <MaterialCommunityIcons name="chip" size={size} color={color} />;
          }
          if (route.name === 'settings') {
            return <Ionicons name="settings-outline" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Library' }} />
      <Tabs.Screen name="device" options={{ title: 'Device Info' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
