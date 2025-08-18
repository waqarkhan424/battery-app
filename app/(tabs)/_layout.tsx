import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22d3ee', // cyan-400
        tabBarInactiveTintColor: '#94a3b8', // slate-400
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: '#0b1221', // darker than your background for contrast
          borderTopColor: '#131e33',
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'index') {
            // Different icon from the prior “home” look
            return <Ionicons name="grid-outline" size={size} color={color} />;
          }
          if (route.name === 'device') {
            // Different visual language: chip icon (not a phone outline)
            return <MaterialCommunityIcons name="chip" size={size} color={color} />;
          }
          if (route.name === 'settings') {
            // Different icon than before to avoid “stock” feel
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

