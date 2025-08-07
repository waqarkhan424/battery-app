import ApplySettingsModal from '@/components/apply-settings-modal';
import BottomControls from '@/components/bottom-controls';
import CloseButton from '@/components/close-button';
import VideoHeader from '@/components/video-header';
import { useSettingsStore } from '@/store/settings';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { BatteryState, useBatteryLevel, useBatteryState } from 'expo-battery';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { NativeModules, Text, View } from 'react-native';

const { ChargingServiceModule } = NativeModules;

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // battery info & user settings
  const batteryState = useBatteryState();
  const batteryLevel = useBatteryLevel();
  const appliedAnimation = useSettingsStore(s => s.appliedAnimation);
  const hideBatteryPercentage = useSettingsStore(s => s.hideBatteryPercentage);

  // hide controls when charging after applying
  const autoHide = batteryState === BatteryState.CHARGING && appliedAnimation != null;
  const batteryPct = batteryLevel != null ? Math.round(batteryLevel * 100) : '';

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

      {(showControls && !autoHide) ? (
        <BottomControls
          onOpenModal={() => setShowSettingsModal(true)}
          onEyePress={() => setShowControls(false)}
        />
      ) : (
        <View className="absolute bottom-6 left-0 right-0 items-center">
          <View className="w-14 h-14 rounded-full bg-slate-800 items-center justify-center">
            <Ionicons name="battery-charging-outline" size={28} color="white" />
          </View>
          {!hideBatteryPercentage && (
            <Text className="text-white mt-2 text-lg">
              {batteryPct}%
            </Text>
          )}
        </View>
      )}

      <ApplySettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onApply={() => {
          setShowSettingsModal(false);
          // Start the native service with the applied animation URL
          ChargingServiceModule.startService(decodeURIComponent(videoUrl));
          router.replace('/');
        }}
        videoUrl={decodeURIComponent(videoUrl)}
      />
    </View>
  );
}
