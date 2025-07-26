import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DownloadState = {
  progress: number;
  downloading: boolean;
  uri: string | null;
};

export default function SeeMoreScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [downloads, setDownloads] = useState<{ [key: string]: DownloadState }>({});

  useEffect(() => {
    if (category) {
      fetchVideosFromGitHub(category).then(setVideos);
    }
  }, [category]);

  const handleDownloadOrPlay = async (video: VideoItem) => {
    const fileName = video.url.split('/').pop();
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    if (downloads[video.id]?.uri) {
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(downloads[video.id].uri!) },
      });
      return;
    }

    setDownloads((prev) => ({
      ...prev,
      [video.id]: { downloading: true, progress: 0, uri: null },
    }));

    const downloadResumable = FileSystem.createDownloadResumable(
      video.url,
      fileUri,
      {},
      (progress) => {
        const percent =
          progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
        setDownloads((prev) => ({
          ...prev,
          [video.id]: {
            ...prev[video.id],
            progress: Math.round(percent * 100),
          },
        }));
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setDownloads((prev) => ({
          ...prev,
          [video.id]: {
            downloading: false,
            progress: 100,
            uri: result.uri,
          },
        }));

        router.push({
          pathname: '/video-player/[videoUrl]',
          params: { videoUrl: encodeURIComponent(result.uri) },
        });
      }
    } catch (err) {
      console.error('Download failed:', err);
      setDownloads((prev) => ({
        ...prev,
        [video.id]: { downloading: false, progress: 0, uri: null },
      }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Sticky Top Bar */}
      <View className="px-4 py-4 flex-row items-center justify-center relative z-10">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold capitalize text-center">
          {category}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row flex-wrap justify-between">
          {videos.map((video) => {
            const state = downloads[video.id] || {
              downloading: false,
              progress: 0,
              uri: null,
            };

            return (
              <Pressable
                key={video.id}
                onPress={() => handleDownloadOrPlay(video)}
                className="w-[32%] aspect-[2/3] bg-black mb-2 rounded-lg overflow-hidden relative items-center justify-center"
              >
                <Image
                  source={{ uri: video.thumbnail }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />

                {state.downloading && (
                  <View className="absolute bottom-2 left-2 right-2 flex-row justify-between items-center bg-black/60 px-2 py-1 rounded">
                    <Text className="text-white text-xs">{state.progress}%</Text>
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}

                {!state.downloading && !state.uri && (
                  <View className="absolute bottom-2 right-2 bg-black/60 p-1 rounded-full">
                    <Ionicons name="cloud-download-outline" size={18} color="white" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
