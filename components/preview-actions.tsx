import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

type Props = {
  /** Opens the Apply settings modal */
  onOpenModal: () => void;
};

/**
 * Top overlay actions for the preview page:
 * - Close (top-left)
 * - Apply (top-right)
 */
export default function PreviewActions({ onOpenModal }: Props) {
  const router = useRouter();

  return (
    <View pointerEvents="box-none">
      {/* Close */}
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close preview"
        hitSlop={10}
        className="absolute top-10 left-4 z-20 bg-neutral-800/80 w-10 h-10 rounded-full items-center justify-center"
      >
        <Ionicons name="close" size={24} color="white" />
      </Pressable>

      {/* Apply */}
      <Pressable
        onPress={onOpenModal}
        accessibilityRole="button"
        accessibilityLabel="Apply this animation"
        hitSlop={10}
        className="absolute top-10 right-4 z-20 bg-cyan-400 w-10 h-10 rounded-full items-center justify-center"
      >
        <Ionicons name="checkmark" size={24} color="white" />
      </Pressable>
    </View>
  );
}
