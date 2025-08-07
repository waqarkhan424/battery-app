 import { useSettingsStore } from '@/store/settings';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({ strict: false }); // turn off strict-mode warnings

export default function RootLayout() {

 const { enableAnimations, appliedAnimation } = useSettingsStore();

 useEffect(() => {
  if (enableAnimations) {
    NativeModules.ChargingServiceModule.startService(appliedAnimation ?? '');
  }
}, [enableAnimations]);


  return (
    <Stack>
      {/* Hide header for tab screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Hide header for video player */}
      <Stack.Screen name="video-player/[videoUrl]" options={{ headerShown: false }} />

      {/* Hide header for see-more */}
      <Stack.Screen name="see-more/[category]" options={{ headerShown: false }} />
    </Stack>
  );
}
