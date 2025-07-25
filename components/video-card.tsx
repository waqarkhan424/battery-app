import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

type Props = {
  url: string;
  thumbnail: string;
};

export default function VideoCard({ url, thumbnail }: Props) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

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
      setDownloadProgress(0);

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (progress) => {
          const percentage =
            progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(Math.round(percentage * 100));
        }
      );

      try {
        const result = await downloadResumable.downloadAsync();
        if (result && result.uri) {
          setLocalUri(result.uri);
          router.push({
            pathname: '/video-player/[videoUrl]',
            params: { videoUrl: encodeURIComponent(result.uri) },
          });
        }
      } catch (error) {
        console.error('Download failed:', error);
      } finally {
        setDownloading(false);
      }
    }
  };

  return (
    <Pressable onPress={handlePress} className="active:scale-95 transition duration-100">
      <View className="w-32 h-48 rounded-lg overflow-hidden bg-black mr-3 relative shadow-md">
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: '85%', backgroundColor: 'black' }}
          resizeMode="cover"
        />

        <View className="absolute bottom-2 right-2 flex-row items-center">
          {downloading ? (
            <>
              <Text className="text-white text-xs mr-2">{downloadProgress}%</Text>
              <ActivityIndicator size="small" color="white" />
            </>
          ) : (
            <Ionicons
              name={localUri ? 'play-circle-outline' : 'cloud-download-outline'}
              size={20}
              color="white"
              style={{ opacity: 0.8 }}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
