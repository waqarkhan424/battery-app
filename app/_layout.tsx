import { useSettingsStore } from '@/store/settings';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({ strict: false }); // turn off strict-mode warnings

export default function RootLayout() {
  const { enableAnimations } = useSettingsStore();

  useEffect(() => {
    if (!enableAnimations) {
      NativeModules.ChargingServiceModule?.stopService?.();
    }
  }, [enableAnimations]);

  return (
    <Stack>
      {/* Hide header for tab screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Preview screen */}
      <Stack.Screen name="preview/[videoUrl]" options={{ headerShown: false }} />

      {/* See more */}
      <Stack.Screen name="seemore/[category]" options={{ headerShown: false }} />
    </Stack>
  );
}
