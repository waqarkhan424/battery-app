import ApplySettingsModal from '@/components/apply-settings-modal';
import BottomControls from '@/components/bottom-controls';
import CloseButton from '@/components/close-button';
import VideoHeader from '@/components/video-header';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

      <BottomControls onOpenModal={() => setShowSettingsModal(true)} />

      <ApplySettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onApply={() => {
          setShowSettingsModal(false);
          console.log('Settings Applied');
        }}
         videoUrl={decodeURIComponent(videoUrl)}
      />
    </View>
  );
}
