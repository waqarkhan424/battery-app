import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  if (!videoUrl) return null;

  return (
    <View className="flex-1 bg-black">
      {/* Video Area */}
      <Video
        source={{ uri: decodeURIComponent(videoUrl) }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
      />

      {/* Bottom Icons */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-10">
        {/* Eye Icon */}
        <Pressable onPress={() => console.log('Eye icon pressed')}>
          <View className="w-14 h-14 rounded-full bg-yellow-400 items-center justify-center">
            <Ionicons name="eye-outline" size={28} color="white" />
          </View>
        </Pressable>

        {/* Tick Icon */}
        <Pressable onPress={() => console.log('Check icon pressed')}>
          <View className="w-14 h-14 rounded-full bg-cyan-400 items-center justify-center">
            <Ionicons name="checkmark" size={28} color="white" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
