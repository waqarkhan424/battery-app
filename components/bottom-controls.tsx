import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type Props = {
  onOpenModal: () => void;
};

export default function BottomControls({ onOpenModal }: Props) {
  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <Pressable onPress={onOpenModal}>
        <View className="w-14 h-14 rounded-full bg-cyan-400 items-center justify-center">
          <Ionicons name="checkmark" size={28} color="white" />
        </View>
      </Pressable>
    </View>
  );
}
