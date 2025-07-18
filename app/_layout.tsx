import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#22d3ee', // Cyan-400
        tabBarInactiveTintColor: '#94a3b8', // Slate-400
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Slate-900
          borderTopColor: '#1e293b', // Slate-800
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'index') iconName = 'home';
          if (route.name === 'battery') iconName = 'battery-half';
          if (route.name === 'device') iconName = 'phone-portrait';
          if (route.name === 'settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="battery" options={{ title: 'Battery' }} />
      <Tabs.Screen name="device" options={{ title: 'Device' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
