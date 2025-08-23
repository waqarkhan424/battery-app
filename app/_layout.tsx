import { useSettingsStore } from '@/store/settings';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({ strict: false }); // turn off strict-mode warnings

const { ChargingServiceModule } = NativeModules as {
  ChargingServiceModule?: {
    stopService?: () => void;
    startServiceIfConfigured?: () => void;
  };
};

export default function RootLayout() {
  const { enableAnimations } = useSettingsStore();

  useEffect(() => {
    if (!enableAnimations) {
      ChargingServiceModule?.stopService?.();
    } else {
      // make sure the service comes back with the last applied video
      ChargingServiceModule?.startServiceIfConfigured?.();
    }
  }, [enableAnimations]);

  return (
    <Stack>

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Preview screen */}
      <Stack.Screen name="preview/[videoUrl]" options={{ headerShown: false }} />
    </Stack>
  );
}
