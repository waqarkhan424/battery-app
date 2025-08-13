import { useSettingsStore } from '@/store/settings';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({ strict: false }); // turn off strict-mode warnings

export default function RootLayout() {
  const { enableAnimations } = useSettingsStore();

  // IMPORTANT: don't start the service with an empty URL.
  // Only stop the service when user disables animations.
  useEffect(() => {
    if (!enableAnimations) {
      NativeModules.ChargingServiceModule?.stopService?.();
    }
  }, [enableAnimations]);

  return (
    <Stack>
      {/* Hide header for tab screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Deep-link charging screen used by the service */}
      <Stack.Screen name="charging/[videoUrl]" options={{ headerShown: false }} />

      {/* Manual preview player (keep if you use it elsewhere) */}
      <Stack.Screen name="video-player/[videoUrl]" options={{ headerShown: false }} />

      {/* See-more */}
      <Stack.Screen name="see-more/[category]" options={{ headerShown: false }} />
    </Stack>
  );
}
