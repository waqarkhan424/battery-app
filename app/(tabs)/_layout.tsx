import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,

        //  No manual insets, no fixed height. Let React Navigation size the bar.
        tabBarStyle: {
          backgroundColor: '#0b1221',
          borderTopColor: '#131e33',
        },

        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },

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
