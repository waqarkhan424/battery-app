import VideoHeader from '@/components/video-header';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useBatteryLevel } from 'expo-battery';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Text, View } from 'react-native';

export default function ChargingScreen() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const batteryLevel = useBatteryLevel();
  const batteryPct = batteryLevel != null ? Math.round(batteryLevel * 100) : '';
  const playerRef = useRef<Video>(null);

  const uri = videoUrl ? decodeURIComponent(videoUrl) : null;
  if (!uri) return null;

  // Fallback: if activity is already in foreground, kick playback on focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          if (active) await playerRef.current?.playAsync();
        } catch {}
      })();
      return () => {
        active = false;
        playerRef.current?.pauseAsync().catch(() => {});
      };
    }, [uri])
  );

  return (
    <View className="flex-1 bg-black">
      {/* Header with current time */}
      <VideoHeader />

      {/* Looping animation video */}
      <Video
        key={uri}
        ref={playerRef}
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}  // start only when ready to display
        isLooping
        onReadyForDisplay={async () => {
          try {
            await playerRef.current?.playAsync();
          } catch {}
        }}
      />

      {/* Battery icon + percentage overlay */}
      <View className="absolute bottom-6 left-0 right-0 items-center">
        <View className="w-14 h-14 rounded-full bg-slate-800 items-center justify-center">
          <Ionicons name="battery-charging-outline" size={28} color="white" />
        </View>
        <Text className="text-white mt-2 text-lg">
          {batteryPct !== '' ? `${batteryPct}%` : ''}
        </Text>
      </View>
    </View>
  );
}
