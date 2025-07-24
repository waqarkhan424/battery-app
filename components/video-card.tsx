import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';

type Props = {
  url: string;
  thumbnail: string;
};

export default function VideoCard({ url, thumbnail }: Props) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fileName = url.split('/').pop();
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  const handlePress = async () => {
    if (localUri) {
      // Already downloaded, open player
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    } else {
      // Download video
      setDownloading(true);
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      setLocalUri(uri);
      setDownloading(false);

      // Open full-screen after download
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(uri) },
      });
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View className="w-32 h-40 rounded-lg overflow-hidden bg-black mr-3 relative">
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {downloading ? (
          <ActivityIndicator
            size="small"
            color="white"
            style={{ position: 'absolute', bottom: 6, left: '50%', marginLeft: -12 }}
          />
        ) : (
          <Ionicons
            name={localUri ? 'play-circle-outline' : 'cloud-download-outline'}
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
        )}
      </View>
    </Pressable>
  );
}
