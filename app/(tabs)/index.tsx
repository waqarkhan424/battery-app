import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useSettingsStore } from '@/store/settings';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const categories = ['animal', 'cartoon', 'circle'];

export default function HomeScreen() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});
  const { enableAnimations } = useSettingsStore();

  useEffect(() => {
    const load = async () => {
      const data: Record<string, VideoItem[]> = {};
      for (const category of categories) {
        data[category] = await fetchVideosFromGitHub(category);
      }
      setVideosByCategory(data);
    };
    load();
  }, []);

  if (!enableAnimations) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-white text-base">Animations are disabled in settings.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-6">
      {categories.map((category) => (
        <View key={category} className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-lg font-medium capitalize">{category}</Text>
            <Pressable onPress={() => router.push({ pathname: '/see-more/[category]', params: { category } })}>
              <Text className="text-white text-lg font-medium">See More</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {videosByCategory[category]?.map((video) => (
              <VideoCard key={video.id} url={video.url} thumbnail={video.thumbnail} />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}
