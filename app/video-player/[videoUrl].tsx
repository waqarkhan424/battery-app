import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function VideoPlayer() {
  const { videoUrl } = useLocalSearchParams<{ videoUrl: string }>();
  if (!videoUrl) return null;

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Video
        source={{ uri: decodeURIComponent(videoUrl) }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
      />
    </View>
  );
}

// This removes the title from the header
VideoPlayer.options = {
  title: '',
  headerShown: false,
};
