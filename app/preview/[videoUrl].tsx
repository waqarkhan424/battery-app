import ApplySettingsModal from '@/components/apply-settings-modal';
import PreviewActions from '@/components/preview-actions';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { NativeModules, View } from 'react-native';

const { ChargingServiceModule } = NativeModules;

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (!videoUrl) return null;
  const uri = decodeURIComponent(videoUrl);

  // Create a player that loops & starts immediately (same behavior as before)
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <View className="flex-1 bg-black">
      <PreviewActions onOpenModal={() => setShowSettingsModal(true)} />

      {/* Video view (no native controls, contain behavior like ResizeMode.CONTAIN) */}
      <VideoView
        style={{ width: '100%', height: '100%' }}
        player={player}
        nativeControls={false}
        contentFit="contain"
      />

      <ApplySettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onApply={() => {
          setShowSettingsModal(false);
          // Tell the native service to use this file:// video for plug-in events
          ChargingServiceModule.startService(uri);
          router.replace('/');
        }}
        videoUrl={uri}
      />
    </View>
  );
}
