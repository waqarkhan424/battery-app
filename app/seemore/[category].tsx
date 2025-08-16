import VideoItemCard from '@/components/video-item-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SeeMoreScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      if (!category) return;
      const fetched = await fetchVideosFromGitHub(category);
      setVideos(fetched);
    };

    loadVideos();
  }, [category]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 flex-row items-center justify-center relative z-10">
        <Pressable onPress={() => router.back()} className="absolute left-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold capitalize text-center">
          {category}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row flex-wrap justify-between">
          {videos.map((video) => (
            <VideoItemCard
              key={video.id}
              video={video}
              styleClass="w-[32%] aspect-[2/3] bg-black mb-2 rounded-lg overflow-hidden relative items-center justify-center"
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
