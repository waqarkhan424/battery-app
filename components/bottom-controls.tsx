import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type Props = {
  onOpenModal: () => void;
  onEyePress: () => void;   // new prop
};

export default function BottomControls({ onOpenModal, onEyePress }: Props) {
  return (
    <View className="absolute bottom-6 left-0 right-0 flex-row justify-center space-x-10">
      <Pressable onPress={onEyePress}>
        <View className="w-14 h-14 rounded-full bg-yellow-400 items-center justify-center">
          <Ionicons name="eye-outline" size={28} color="white" />
        </View>
      </Pressable>
      <Pressable onPress={onOpenModal}>
        <View className="w-14 h-14 rounded-full bg-cyan-400 items-center justify-center">
          <Ionicons name="checkmark" size={28} color="white" />
        </View>
      </Pressable>
    </View>
  );
}
