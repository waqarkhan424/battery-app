import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useSettingsStore } from '@/store/settings';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const categories = ['animal', 'cartoon', 'circle'];

export default function HomeScreen() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});
  const { enableAnimations } = useSettingsStore(); // ✅ use the toggle

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
          <Text className="text-white text-xl font-bold mb-2 capitalize">{category}</Text>
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
