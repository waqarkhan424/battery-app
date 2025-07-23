import { ResizeMode, Video } from 'expo-av';
import { View } from 'react-native';

type Props = { url: string };

export default function VideoCard({ url }: Props) {
  return (
    <View className="w-32 h-40 rounded-lg overflow-hidden bg-black mr-3">
      <Video
        source={{ uri: url }}
        style={{ width: '100%', height: '100%' }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        useNativeControls={false}
      />
    </View>
  );
}
