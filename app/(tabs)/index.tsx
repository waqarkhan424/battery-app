import VideoCard from '@/components/video-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useSettingsStore } from '@/store/settings';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
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
  const [infoVisible, setInfoVisible] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false); // new state

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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-8">
        <Pressable onPress={() => setTipsVisible(true)}>
          {/* <Ionicons name="help-circle-outline" size={24} color="#facc15" /> */}
          <Ionicons name="sparkles-outline" size={24} color="#facc15" />
        </Pressable>
        <Pressable onPress={() => setInfoVisible(true)}>
          <Ionicons name="information-circle-outline" size={24} color="#facc15" />
        </Pressable>
      </View>

      {/* Scroll Content */}
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
                <Text className="text-white text-lg font-medium">See More</Text>
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

      {/* Info Modal */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-slate-800 p-6 rounded-2xl w-full">
            <Text className="text-white text-lg font-bold mb-2">About This App</Text>
            <Text className="text-slate-300 mb-4">
              This app provides cool charging animations categorized as Animal, Cartoon, and more. Tap any video to preview and enjoy while charging.
            </Text>
            <Pressable onPress={() => setInfoVisible(false)} className="self-end mt-2">
              <Text className="text-cyan-400 font-bold text-base">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <Modal visible={tipsVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-slate-800 p-6 rounded-2xl w-full">
            <Text className="text-white text-lg font-bold mb-2">Tips to Use This App</Text>
            <View className="space-y-2">
              <Text className="text-slate-300">• Tap any animation to preview it.</Text>
              <Text className="text-slate-300">• Use 'See More' to browse full categories.</Text>
              <Text className="text-slate-300">• Animations auto-play once downloaded.</Text>
              <Text className="text-slate-300">• Use Settings tab to customize behavior.</Text>
            </View>
            <Pressable onPress={() => setTipsVisible(false)} className="self-end mt-4">
              <Text className="text-cyan-400 font-bold text-base">Got It</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
