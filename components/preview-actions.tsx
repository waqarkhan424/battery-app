import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

type Props = {
  /** Opens the Apply settings modal */
  onOpenModal: () => void;
};


export default function PreviewActions({ onOpenModal }: Props) {
  const router = useRouter();

  const hitSlop = { top: 10, right: 10, bottom: 10, left: 10 };

  return (
    <View pointerEvents="box-none">
      {/* Close */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close preview"
        hitSlop={hitSlop}
        className="absolute top-10 left-4 z-20 h-11 w-11 items-center justify-center rounded-full
                   bg-white/10 border border-white/15 shadow-lg"
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
          opacity: pressed ? 0.9 : 1,
        })}
        android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: true, radius: 28 }}
      >
        <Ionicons name="close" size={22} color="#ffffff" />
      </Pressable>

      {/* Apply */}
      <Pressable
        onPress={onOpenModal}
        accessibilityRole="button"
        accessibilityLabel="Apply this animation"
        hitSlop={hitSlop}
        className="absolute top-10 right-4 z-20 h-11 w-11 items-center justify-center rounded-full
                   bg-cyan-500/90 border border-cyan-300/30 shadow-lg"
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
          opacity: pressed ? 0.9 : 1,
        })}
        android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: true, radius: 28 }}
      >
        <Ionicons name="checkmark" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}
