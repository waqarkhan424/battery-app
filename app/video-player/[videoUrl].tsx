import ApplySettingsModal from '@/components/apply-settings-modal';
import BottomControls from '@/components/bottom-controls';
import CloseButton from '@/components/close-button';
import VideoHeader from '@/components/video-header';

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { NativeModules, View } from 'react-native';

// expo-video
import { useVideoPlayer, VideoView } from 'expo-video';

const { ChargingServiceModule } = NativeModules;

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!videoUrl) return null;
  const uri = decodeURIComponent(videoUrl);

  // Create a player and start immediately; keep it looping like before.
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <View className="flex-1 bg-black">
      <CloseButton />
      <VideoHeader />

      {/* expo-video equivalent of <Video /> */}
      <VideoView
        key={uri}
        player={player}
        style={{ width: '100%', height: '100%' }}
        // contain == ResizeMode.CONTAIN
        contentFit="contain"
        // keep native controls off; we have our own overlay
        nativeControls={false}
        // allow PiP/fullscreen if you later enable the plugin in app.json
        allowsFullscreen
        allowsPictureInPicture
      />

      {showControls && (
        <BottomControls
          onOpenModal={() => setShowSettingsModal(true)}
          onEyePress={() => setShowControls(false)}
        />
      )}

      <ApplySettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onApply={() => {
          setShowSettingsModal(false);
          // Pass the stable file:// path to the service (unchanged)
          ChargingServiceModule.startService(uri);
          router.replace('/');
        }}
        videoUrl={uri}
      />
    </View>
  );
}
