import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Format Time (e.g., 08:13)
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Format Date (e.g., Friday 25 July 2025)
      const date = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      setCurrentTime(time);
      setCurrentDate(date);
    };

    updateTime(); // Set immediately on mount

    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000;

    const timeout = setTimeout(() => {
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, msToNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  if (!videoUrl) return null;

  return (
    <View className="flex-1 bg-black">
      {/* Close Icon */}
      <Pressable
        onPress={() => router.back()}
        className="absolute top-10 left-4 z-20 bg-neutral-800/80 w-10 h-10 rounded-full items-center justify-center"
      >
        <Ionicons name="close" size={24} color="white" />
      </Pressable>

      {/* Time and Date */}
      <View className="absolute top-10 left-0 right-0 items-center z-10">
        <Text className="text-white text-4xl font-bold">{currentTime}</Text>
        <Text className="text-white text-base">{currentDate}</Text>
      </View>

      {/* Full-screen video */}
      <Video
        source={{ uri: decodeURIComponent(videoUrl) }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
      />

      {/* Bottom Icons */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-10">
        <Pressable onPress={() => console.log('Eye icon pressed')}>
          <View className="w-14 h-14 rounded-full bg-yellow-400 items-center justify-center">
            <Ionicons name="eye-outline" size={28} color="white" />
          </View>
        </Pressable>
        <Pressable onPress={() => console.log('Check icon pressed')}>
          <View className="w-14 h-14 rounded-full bg-cyan-400 items-center justify-center">
            <Ionicons name="checkmark" size={28} color="white" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
