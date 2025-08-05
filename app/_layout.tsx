import { useSettingsStore } from '@/store/settings';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { NativeModules } from 'react-native';
// import { NativeModules, Platform } from 'react-native';
import { configureReanimatedLogger } from 'react-native-reanimated';
import ChargingListener from './_charging-listener';
import './global.css';

configureReanimatedLogger({ strict: false });  // ← turn off strict‑mode warnings

export default function RootLayout() {
  const { ChargingServiceModule } = NativeModules;
  const enableAnimations = useSettingsStore(state => state.enableAnimations);


  useEffect(() => {
    if (enableAnimations) {
      ChargingServiceModule.startService();
    }

//   if (Platform.OS === 'android' && enableAnimations) {
//       ChargingServiceModule.startService();
//     }

  }, []); // Run only once when app starts

  

    return (
      <>

{/* Charging listener always active */}
      <ChargingListener /> 

  <Stack>
      {/* Hide header for tab screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Hide header for video player */}
      <Stack.Screen name="video-player/[videoUrl]" options={{ headerShown: false }} />

  {/* Hide header for see-more */}
      <Stack.Screen name="see-more/[category]" options={{ headerShown: false }} />


    </Stack>
</>
    );
}
