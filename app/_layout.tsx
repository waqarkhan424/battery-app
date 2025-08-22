import LoadingScreen from '@/components/loading-screen';
import { useSettingsStore } from '@/store/settings';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

// Turn off strict-mode warnings from Reanimated (your existing line)
configureReanimatedLogger({ strict: false });

// Keep the Android 12+ system splash visible until we show our LoadingScreen
SplashScreen.preventAutoHideAsync().catch(() => {});

const { ChargingServiceModule } = NativeModules as {
  ChargingServiceModule?: {
    stopService?: () => void;
    startServiceIfConfigured?: () => void;
  };
};

export default function RootLayout() {
  const { enableAnimations } = useSettingsStore();
  const [appReady, setAppReady] = useState(false);

  // Your existing service start/stop logic (unchanged)
  useEffect(() => {
    if (!enableAnimations) {
      ChargingServiceModule?.stopService?.();
    } else {
      ChargingServiceModule?.startServiceIfConfigured?.();
    }
  }, [enableAnimations]);

  // Boot: hide system splash, then show our LoadingScreen until ready
  useEffect(() => {
    const boot = async () => {
      try {
        // TODO: load fonts, read async storage, prefetch config, etc.
      } finally {
        // Hide the system splash immediately…
        await SplashScreen.hideAsync().catch(() => {});
        // …then render our React LoadingScreen. When your real init is done,
        // set appReady to true.
        setAppReady(true);
      }
    };
    boot();
  }, []);

  // Show our custom "splash" (logo + spinner + name) first
  if (!appReady) {
    return <LoadingScreen />;
  }

  // Then show the real app
  return (
    <Stack>
      {/* Hide header for your tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Preview screen */}
      <Stack.Screen name="preview/[videoUrl]" options={{ headerShown: false }} />
    </Stack>
  );
}
