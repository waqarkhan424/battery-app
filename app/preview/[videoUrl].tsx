import ApplySettingsModal from '@/components/apply-settings-modal';
import PreviewActions from '@/components/preview-actions';
import * as NavigationBar from 'expo-navigation-bar';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useState } from 'react';
import { NativeModules, View } from 'react-native';

const { ChargingServiceModule } = NativeModules as {
  ChargingServiceModule: {
    startServiceWithOptions: (videoUrl: string, durationMs: number, closeMethod: 'single' | 'double') => void;
  };
};

// ---- Hide/show Android system nav bar while this screen is active ----
async function hideSystemNavBar() {
  try {
    // In edge-to-edge, only visibility is supported/needed
    await NavigationBar.setVisibilityAsync('hidden');
  } catch {}
}

async function restoreSystemNavBar() {
  try {
    await NavigationBar.setVisibilityAsync('visible');
  } catch {}
}

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Enter immersive on focus; restore on blur
  useFocusEffect(
    useCallback(() => {
      hideSystemNavBar();
      return () => {
        restoreSystemNavBar();
      };
    }, [])
  );

  if (!videoUrl) return null;
  const uri = decodeURIComponent(videoUrl);

  // Player setup
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.staysActiveInBackground = true;
    p.play();
  });

  return (
    <View className="flex-1 bg-black">
      <PreviewActions onOpenModal={() => setShowSettingsModal(true)} />

      <VideoView
        key={uri}
        style={{ width: '100%', height: '100%' }}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />

      <ApplySettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onApply={(durationMs, closeMethod) => {
          setShowSettingsModal(false);
          // persist options + start service
          ChargingServiceModule.startServiceWithOptions(uri, durationMs, closeMethod);
          router.replace('/');
        }}
        videoUrl={uri}
      />
    </View>
  );
}
