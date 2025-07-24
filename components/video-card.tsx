import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  View,
} from 'react-native';

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
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    } else {
      setDownloading(true);
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      setLocalUri(uri);
      setDownloading(false);

      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(uri) },
      });
    }
  };

  return (
    <Pressable onPress={handlePress} className="active:scale-95 transition duration-100">
      <View className="w-32  h-48 rounded-lg overflow-hidden bg-black mr-3 relative shadow-md">
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '85%', backgroundColor: 'black' }}
          resizeMode="cover"
        />

        <View className="absolute bottom-2 left-0 right-0 items-center">
          {downloading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons
              name={localUri ? 'play-circle-outline' : 'cloud-download-outline'}
              size={24}
              color="white"
              style={{ opacity: 0.8 }}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
