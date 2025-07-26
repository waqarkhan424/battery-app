import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';

export default function SeeMoreScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (category) {
      fetchVideosFromGitHub(category).then(setVideos);
    }
  }, [category]);

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const itemSize = screenWidth / numColumns - 18; // include padding/margin

  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Text className="text-white text-2xl font-bold capitalize mb-4 text-center">
        {category}
      </Text>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingBottom: 30 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        renderItem={({ item }) => (
          <View style={{ width: itemSize }}>
            <VideoCard url={item.url} thumbnail={item.thumbnail} />
          </View>
        )}
      />
    </View>
  );
}
