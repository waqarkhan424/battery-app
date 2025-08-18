import VideoItemCard from '@/components/video-item-card';
import { fetchVideosFromGitHub, VideoItem } from '@/lib/fetch-videos';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

const CATEGORIES = ['animal', 'cartoon', 'circle'] as const;
type Category = typeof CATEGORIES[number];

export default function LibraryScreen() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});
  const [selected, setSelected] = useState<Category>('animal');
  const [infoVisible, setInfoVisible] = useState(false);
  const [tipsVisible, setTipsVisible] = useState(false);

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

  const gridData = useMemo(() => videosByCategory[selected] ?? [], [videosByCategory, selected]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Distinct header: title + subtle actions */}
      <View className="px-4 pt-6 pb-3">
        <Text className="text-white text-2xl font-extrabold">Library</Text>
        <Text className="text-secondary mt-1">Pick a category, then preview or download.</Text>

        <View className="flex-row space-x-2 mt-4">
          {CATEGORIES.map((cat) => {
            const active = cat === selected;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelected(cat)}
                className={`px-3 py-1.5 rounded-full border ${
                  active ? 'bg-cyan-400/20 border-cyan-400' : 'bg-white/5 border-white/10'
                }`}
              >
                <Text className={`capitalize ${active ? 'text-white' : 'text-slate-300'}`}>{cat}</Text>
              </Pressable>
            );
          })}

          <View className="flex-1" />
          <Pressable onPress={() => setTipsVisible(true)} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="sparkles-outline" size={20} color="#facc15" />
          </Pressable>
          <Pressable onPress={() => setInfoVisible(true)} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <Ionicons name="information-circle-outline" size={20} color="#22d3ee" />
          </Pressable>
        </View>
      </View>

      {/* Two-column grid instead of horizontal carousels */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 28 }}>
        <View className="flex-row flex-wrap justify-between">
          {gridData.map((video) => (
            <VideoItemCard
              key={video.id}
              video={video}
              // Taller portrait tiles for a unique look
              styleClass="w-[48%] aspect-[2/3] rounded-2xl overflow-hidden bg-black mb-3"
            />
          ))}
        </View>

        {/* Category CTA that’s different from “See More” row headers */}
        <Pressable
          onPress={() =>
            router.push({ pathname: '/seemore/[category]', params: { category: selected } })
          }
          className="mt-2 mx-1 bg-surface border border-slate-800 rounded-xl px-4 py-3 items-center"
        >
          <Text className="text-white font-semibold">Browse all “{selected}” animations</Text>
        </Pressable>
      </ScrollView>

      {/* Tips modal */}
      <Modal animationType="fade" transparent visible={tipsVisible} onRequestClose={() => setTipsVisible(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-slate-800 rounded-2xl p-6 w-full">
            <Text className="text-white text-lg font-semibold mb-3">Tips</Text>
            <Text className="text-slate-300 mb-4">
              Tap a tile to download & preview. Use “Apply” in preview to enable on charge.
            </Text>
            <Pressable onPress={() => setTipsVisible(false)} className="self-end bg-cyan-400 px-4 py-2 rounded-xl">
              <Text className="text-slate-900 font-extrabold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Info modal */}
      <Modal animationType="fade" transparent visible={infoVisible} onRequestClose={() => setInfoVisible(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-slate-800 rounded-2xl p-6 w-full">
            <Text className="text-white text-lg font-semibold mb-3">About This App</Text>
            <Text className="text-slate-300 mb-4">
              A unique battery animation library. Designs, labels, and layout are original.
            </Text>
            <Pressable onPress={() => setInfoVisible(false)} className="self-end bg-cyan-400 px-4 py-2 rounded-xl">
              <Text className="text-slate-900 font-extrabold">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
