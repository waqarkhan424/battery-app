import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

  // Check if the video already exists in the album
  useEffect(() => {
    const checkSavedVideo = async () => {
      try {
        const permissions = await MediaLibrary.requestPermissionsAsync();
        if (permissions.status !== 'granted') return;

        const album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
        if (!album) return;

        const assets = await MediaLibrary.getAssetsAsync({
          mediaType: 'video',
          first: 1000,
          album,
        });

        const matched = assets.assets?.find((a) => a.filename === fileName);
        if (matched) {
          setLocalUri(matched.uri);
        }
      } catch (err) {
        console.error('Error checking saved video:', err);
      }
    };

    checkSavedVideo();
  }, []);

  const handlePress = async () => {
    if (localUri) {
      console.log("localUri:::::::::::::", localUri);
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    } else {
      setDownloading(true);
      setDownloadProgress(0);

      const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        tempFileUri,
        {},
        (progress) => {
          const percentage =
            progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(Math.round(percentage * 100));
        }
      );

      try {
        const result = await downloadResumable.downloadAsync();

        if (result?.uri) {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            alert('Permission denied to access storage');
            return;
          }

          const asset = await MediaLibrary.createAssetAsync(result.uri);

          let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
          if (!album) {
            album = await MediaLibrary.createAlbumAsync('BatteryAnimations', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }

          // Wait briefly for system to reindex the asset
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Re-fetch asset from album to get updated path
          const refreshedAssets = await MediaLibrary.getAssetsAsync({
            mediaType: 'video',
            first: 1000,
            album,
          });

          const updatedAsset = refreshedAssets.assets.find((a) => a.filename === fileName);
          if (updatedAsset) {
            setLocalUri(updatedAsset.uri);
            console.log("updatedAsset.uri:::::::::::::", updatedAsset.uri);

            router.push({
              pathname: '/video-player/[videoUrl]',
              params: { videoUrl: encodeURIComponent(updatedAsset.uri) },
            });
          }
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
          style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
          resizeMode="cover"
        />

        <View className="absolute bottom-2 left-0 right-0 px-2 flex-row justify-between items-center">
          {downloading ? (
            <>
              <Text className="text-white text-xs">{downloadProgress}%</Text>
              <ActivityIndicator size="small" color="white" />
            </>
          ) : (
            !localUri && (
              <View className="w-full items-end">
                <Ionicons
                  name="cloud-download-outline"
                  size={20}
                  color="white"
                  style={{ opacity: 0.8 }}
                />
              </View>
            )
          )}
        </View>
      </View>
    </Pressable>
  );
}
