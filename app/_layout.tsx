import { Stack } from 'expo-router';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({ strict: false });  // ← turn off strict‑mode warnings

export default function RootLayout() {
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
