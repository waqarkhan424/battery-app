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

  // Player setup
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.staysActiveInBackground = true; //  keeps player stable across screen changes
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
        onApply={() => {
          setShowSettingsModal(false);
          ChargingServiceModule.startService(uri);
          router.replace('/');
        }}
        videoUrl={uri}
      />
    </View>
  );
}
