import ApplySettingsModal from '@/components/apply-settings-modal';
import BottomControls from '@/components/bottom-controls';
import CloseButton from '@/components/close-button';
import VideoHeader from '@/components/video-header';
import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { NativeModules, View } from 'react-native';

const { ChargingServiceModule } = NativeModules;

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!videoUrl) return null;

  return (
    <View className="flex-1 bg-black">
      <CloseButton />
      <VideoHeader />

      <Video
        source={{ uri: decodeURIComponent(videoUrl) }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
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
          ChargingServiceModule.startService(decodeURIComponent(videoUrl));
          router.replace('/');
        }}
        videoUrl={decodeURIComponent(videoUrl)}
      />
    </View>
  );
}
