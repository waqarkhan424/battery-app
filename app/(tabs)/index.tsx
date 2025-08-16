import VideoItemCard from '@/components/video-item-card';
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
  const [tipsVisible, setTipsVisible] = useState(false);

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
                <VideoItemCard
                  key={video.id}
                  video={{ url: video.url, thumbnail: video.thumbnail }}
                  /* same look your wrapper had */
                  styleClass="w-32 h-48 rounded-lg overflow-hidden bg-black mr-3 relative"
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* Info Modal */}
      <Modal visible={infoVisible} transparent animationType="fade" onRequestClose={() => setInfoVisible(false)}>
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-slate-800 p-6 rounded-2xl w-full">
            <Text className="text-white text-lg font-bold mb-2">About This App</Text>
            <Text className="text-slate-300 mb-4">
              This app provides charging animations organized by categories.
            </Text>
            <Pressable
              onPress={() => setInfoVisible(false)}
              className="mt-2 self-end px-4 py-2 bg-slate-700 rounded-xl"
            >
              <Text className="text-white">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <Modal visible={tipsVisible} transparent animationType="fade" onRequestClose={() => setTipsVisible(false)}>
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-slate-800 p-6 rounded-2xl w-full">
            <Text className="text-white text-lg font-bold mb-2">Tips</Text>
            <Text className="text-slate-300 mb-4">
              Tap a card to download and preview. Once downloaded, tapping plays immediately.
            </Text>
            <Pressable
              onPress={() => setTipsVisible(false)}
              className="mt-2 self-end px-4 py-2 bg-slate-700 rounded-xl"
            >
              <Text className="text-white">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
