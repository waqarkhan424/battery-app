import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useSettingsStore } from '@/store/settings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

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
    <SafeAreaView className="flex-1 bg-background py-6">
      {/* Header with padding from top edge */}
      <View className="flex-row justify-between items-center px-4 py-8  bg-background">
        <Ionicons name="time-outline" size={24} color="white" />
        <Ionicons name="information-circle-outline" size={24} color="white" />
      </View>

      <ScrollView className="flex-1 px-4 pt-2">
        {categories.map((category) => (
          <View key={category} className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-lg font-medium capitalize">{category}</Text>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/see-more/[category]',
                    params: { category },
                  })
                }
              >
                <Text className="text-white text-lg font-medium">View All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videosByCategory[category]?.map((video) => (
                <VideoCard
                  key={video.id}
                  url={video.url}
                  thumbnail={video.thumbnail}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
