import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function SeeMoreScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [downloadedUris, setDownloadedUris] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (category) {
      fetchVideosFromGitHub(category).then(setVideos);
    }
  }, [category]);

  const handleDownloadOrPlay = async (video: VideoItem) => {
    const fileName = video.url.split('/').pop();
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // If already downloaded
    if (downloadedUris[video.id]) {
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(downloadedUris[video.id]) },
      });
      return;
    }

    try {
      const downloadResumable = FileSystem.createDownloadResumable(video.url, fileUri);
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setDownloadedUris((prev) => ({ ...prev, [video.id]: result.uri }));
        router.push({
          pathname: '/video-player/[videoUrl]',
          params: { videoUrl: encodeURIComponent(result.uri) },
        });
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-6">
      <Text className="text-white text-2xl font-bold capitalize mb-4">
        {category}
      </Text>

      <View className="flex-row flex-wrap justify-between">
        {videos.map((video) => (
          <Pressable
            key={video.id}
            onPress={() => handleDownloadOrPlay(video)}
            className="w-[30%] aspect-[2/3] bg-black mb-4 rounded-lg overflow-hidden relative items-center justify-center"
          >
            <Image
              source={{ uri: video.thumbnail }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {!downloadedUris[video.id] && (
              <View className="absolute bottom-2 right-2 bg-black/60 p-1 rounded-full">
                <Ionicons name="cloud-download-outline" size={18} color="white" />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
