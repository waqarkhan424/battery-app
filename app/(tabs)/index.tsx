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
                    pathname: '/seemore/[category]',
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

      {/* Tips modal (simple placeholder) */}
      <Modal animationType="fade" transparent visible={tipsVisible} onRequestClose={() => setTipsVisible(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-slate-800 rounded-2xl p-6 w-full">
            <Text className="text-white text-lg font-semibold mb-3">Tips</Text>
            <Text className="text-slate-300 mb-4">Tap a thumbnail to download & preview the animation.</Text>
            <Pressable onPress={() => setTipsVisible(false)} className="self-end bg-cyan-400 px-4 py-2 rounded-xl">
              <Text className="text-white font-semibold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Info modal (simple placeholder) */}
      <Modal animationType="fade" transparent visible={infoVisible} onRequestClose={() => setInfoVisible(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-slate-800 rounded-2xl p-6 w-full">
            <Text className="text-white text-lg font-semibold mb-3">About</Text>
            <Text className="text-slate-300 mb-4">Battery animations preview app.</Text>
            <Pressable onPress={() => setInfoVisible(false)} className="self-end bg-cyan-400 px-4 py-2 rounded-xl">
              <Text className="text-white font-semibold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
