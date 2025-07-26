import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function SeeMoreScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (category) {
      fetchVideosFromGitHub(category).then(setVideos);
    }
  }, [category]);

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-6">
      <Text className="text-white text-2xl font-bold capitalize mb-4">
        {category}
      </Text>
      <View className="flex-row flex-wrap justify-start">
        {videos.map((video) => (
          <View key={video.id} className="mb-4 mr-3">
            <VideoCard url={video.url} thumbnail={video.thumbnail} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
