import { Stack } from 'expo-router';
import { configureReanimatedLogger } from 'react-native-reanimated';
import './global.css';

configureReanimatedLogger({ strict: false });  // ← turn off strict‑mode warnings

export default function RootLayout() {
    return (
        // <Stack>
        //     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        // </Stack>


  <Stack>
      {/* Hide header for tab screens */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Hide header for video player */}
      <Stack.Screen name="video-player/[videoUrl]" options={{ headerShown: false }} />
    </Stack>

    );
}
