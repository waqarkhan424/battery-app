import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
          if (route.name === 'index') {
            return <Ionicons name="home" size={size} color={color} />;
          }
          if (route.name === 'battery') {
            return (
              <MaterialCommunityIcons
                name="battery"
                size={size}
                color={color}
              />
            ); // stand-up battery icon
          }
          if (route.name === 'device') {
            return (
              <MaterialCommunityIcons
                name="cellphone"
                size={size}
                color={color}
              />
            ); // better "device" icon
          }
          if (route.name === 'settings') {
            return <Ionicons name="settings" size={size} color={color} />;
          }
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
