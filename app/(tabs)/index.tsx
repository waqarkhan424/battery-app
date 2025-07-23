import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetchVideos';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const categories = ['animal', 'cartoon', 'circle'];

export default function HomeScreen() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});

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

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-6">
      {categories.map((category) => (
        <View key={category} className="mb-6">
          <Text className="text-white text-xl font-bold mb-2 capitalize">{category}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {videosByCategory[category]?.map((video) => (
              <VideoCard key={video.id} url={video.url} />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}
