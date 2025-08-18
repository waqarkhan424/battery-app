import ApplySettingsModal from '@/components/apply-settings-modal';
import PreviewActions from '@/components/preview-actions';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import { NativeModules, View } from 'react-native';

const { ChargingServiceModule } = NativeModules;

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const viewRef = useRef<any>(null);

  if (!videoUrl) return null;
  const uri = decodeURIComponent(videoUrl);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    // (optional) iOS background audio & Now Playing card
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
    p.play();
  });

  return (
    <View className="flex-1 bg-black">
      <PreviewActions onOpenModal={() => setShowSettingsModal(true)} />

      <VideoView
        ref={viewRef}
        key={uri}
        style={{ width: '100%', height: '100%' }}
        player={player}
        contentFit="contain"
        nativeControls={false}          
        allowsFullscreen                 
        allowsPictureInPicture           
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
