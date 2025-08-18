import VideoItemCard from '@/components/video-item-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = ['animal', 'cartoon', 'circle'] as const;
type Category = typeof CATEGORIES[number];

export default function LibraryScreen() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});
  const [selected, setSelected] = useState<Category>('animal');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const load = async () => {
      const data: Record<string, VideoItem[]> = {};
      for (const cat of CATEGORIES) {
        data[cat] = await fetchVideosFromGitHub(cat);
      }
      setVideosByCategory(data);
    };
    load();
  }, []);

  const gridData = useMemo(
    () => videosByCategory[selected] ?? [],
    [videosByCategory, selected]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header: category chips only */}
      <View className="px-4 pt-6 pb-3">
        <View className="flex-row flex-wrap mt-4">
          {CATEGORIES.map((cat) => {
            const active = cat === selected;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelected(cat)}
                className={`px-3 py-1.5 mr-2 mb-2 rounded-full border ${
                  active ? 'bg-cyan-400/20 border-cyan-400' : 'bg-white/5 border-white/10'
                }`}
              >
                <Text className={`capitalize ${active ? 'text-white' : 'text-slate-300'}`}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Two-column grid: shows ALL videos for the selected category */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 12,
          // add safe bottom so content doesn't hide behind the tab bar
          paddingBottom: 28 + insets.bottom,
        }}
      >
        <View className="flex-row flex-wrap justify-between">
          {gridData.map((video) => (
            <VideoItemCard
              key={video.id}
              video={video}
              styleClass="w-[48%] aspect-[2/3] rounded-2xl overflow-hidden bg-black mb-3"
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
