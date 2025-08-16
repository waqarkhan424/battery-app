import ApplySettingsModal from '@/components/apply-settings-modal';
import BottomControls from '@/components/bottom-controls';
import CloseButton from '@/components/close-button';
import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { NativeModules, View } from 'react-native';

const { ChargingServiceModule } = NativeModules;

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const playerRef = useRef<Video>(null);

  if (!videoUrl) return null;
  const uri = decodeURIComponent(videoUrl);

  return (
    <View className="flex-1 bg-black">
      <CloseButton />

      <Video
        key={uri}
        ref={playerRef}
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping
        onReadyForDisplay={async () => {
          try {
            await playerRef.current?.playAsync();
          } catch {}
        }}
      />

      <BottomControls onOpenModal={() => setShowSettingsModal(true)} />

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
