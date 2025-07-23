import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

type Props = {
  url: string;
};

export default function VideoCard({ url }: Props) {
  console.log("url:::::::::::" ,url)
  const thumbnail = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Thumbnail';

  const handleOpenFullScreen = () => {
    router.push({
      pathname: '/video-player/[videoUrl]',
      params: { videoUrl: url },
    });
  };

  return (
    <Pressable onPress={handleOpenFullScreen}>
      <View className="w-32 h-40 rounded-lg overflow-hidden bg-black mr-3 relative">
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <Ionicons
          name="cloud-download-outline"
          size={24}
          color="white"
          style={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            marginLeft: -12,
            opacity: 0.8,
          }}
        />
      </View>
    </Pressable>
  );
}
