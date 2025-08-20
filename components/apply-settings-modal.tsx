import { useSettingsStore } from '@/store/settings';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  // now passes durationMs and closeMethod to the parent
  onApply: (durationMs: number, closeMethod: 'single' | 'double') => void;
  videoUrl: string;
};

const DURATION_OPTIONS = ['10 seconds', '30 seconds', '1 minute', 'Always'] as const;
const CLOSE_OPTIONS = ['Single Tap To Hide', 'Double Tap To Hide'] as const;

function toDurationMs(label: (typeof DURATION_OPTIONS)[number]) {
  switch (label) {
    case '10 seconds': return 10_000;
    case '30 seconds': return 30_000;
    case '1 minute': return 60_000;
    case 'Always': return -1; // sentinel = do not auto-dismiss
  }
}

function toCloseMethod(label: (typeof CLOSE_OPTIONS)[number]): 'single' | 'double' {
  return label.startsWith('Single') ? 'single' : 'double';
}

export default function ApplySettingsModal({ visible, onClose, onApply, videoUrl }: Props) {
  const [duration, setDuration] = useState<(typeof DURATION_OPTIONS)[number]>('1 minute');
  const [closeMethod, setCloseMethod] = useState<(typeof CLOSE_OPTIONS)[number]>('Single Tap To Hide');
  const insets = useSafeAreaInsets();

  const setAppliedAnimation = useSettingsStore((state) => state.setAppliedAnimation);

  // read & write remembered selections from store (persisted)
  const lastDurationLabel = useSettingsStore((s) => s.lastDurationLabel);
  const lastCloseLabel = useSettingsStore((s) => s.lastCloseLabel);
  const setLastOptions = useSettingsStore((s) => s.setLastOptions);

  // whenever the modal opens, initialize from remembered selections
  useEffect(() => {
    if (visible) {
      setDuration(lastDurationLabel);
      setCloseMethod(lastCloseLabel);
    }
  }, [visible, lastDurationLabel, lastCloseLabel]);

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop (tap to dismiss) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close apply settings"
        onPress={onClose}
        className="absolute inset-0 bg-black/55"
      />

      {/* Glass card */}
      <View
        className="flex-1 items-center justify-end"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
      >
        <BlurView intensity={35} tint="dark" className="w-[92%] rounded-3xl overflow-hidden">
          {/* Card header */}
          <View className="bg-white/5 px-5 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-cyan-400/20 items-center justify-center mr-2">
                <Ionicons name="options-outline" size={16} color="#22d3ee" />
              </View>
              <Text className="text-white text-base font-semibold">Apply Settings</Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#ffffff" />
            </Pressable>
          </View>

          {/* Card body */}
          <View className="bg-slate-900/60 px-5 pt-4 pb-3">
            {/* Duration */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={16} color="#94a3b8" />
                <Text className="text-slate-300 ml-2 text-sm">Animation duration</Text>
              </View>

              <View className="flex-row flex-wrap">
                {DURATION_OPTIONS.map((opt) => {
                  const selected = duration === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setDuration(opt)}
                      className={`px-3 py-1.5 mr-2 mb-2 rounded-lg border ${
                        selected ? 'bg-cyan-400/20 border-cyan-400' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <Text className={`text-xs ${selected ? 'text-white' : 'text-slate-300'}`}>
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Closing method */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="hand-left-outline" size={16} color="#94a3b8" />
                <Text className="text-slate-300 ml-2 text-sm">Closing method</Text>
              </View>

              <View className="flex-row flex-wrap">
                {CLOSE_OPTIONS.map((opt) => {
                  const selected = closeMethod === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setCloseMethod(opt)}
                      className={`px-3 py-1.5 mr-2 mb-2 rounded-lg border ${
                        selected ? 'bg-cyan-400/20 border-cyan-400' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <Text className={`text-xs ${selected ? 'text-white' : 'text-slate-300'}`}>
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="text-slate-400 text-[11px] mt-1">
                These options affect how long the animation stays visible and how to hide it quickly.
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={onClose}
                className="flex-1 mr-2 bg-white/5 border border-white/10 rounded-xl py-2 items-center"
              >
                <Text className="text-white font-semibold text-sm">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setAppliedAnimation(videoUrl);
                  const durationMs = toDurationMs(duration);
                  const method = toCloseMethod(closeMethod);

                  // remember the user’s choices for next time
                  setLastOptions(duration, closeMethod);

                  onApply(durationMs, method);
                }}
                className="flex-1 ml-2 bg-cyan-400 rounded-xl py-2 items-center"
              >
                <Text className="text-slate-900 font-extrabold text-sm">Apply</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}
