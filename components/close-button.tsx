import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export default function CloseButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      className="absolute top-10 left-4 z-20 bg-neutral-800/80 w-10 h-10 rounded-full items-center justify-center"
    >
      <Ionicons name="close" size={24} color="white" />
    </Pressable>
  );
}
