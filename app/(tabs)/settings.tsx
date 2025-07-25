import { useSettingsStore } from '@/store/settings';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { enableAnimations, setEnableAnimations } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-white text-2xl font-bold mb-6 text-center">Settings</Text>

      {/* Enable Animations Toggle */}
      <View className="flex-row justify-between items-center bg-surface p-4 rounded mb-4">
        <Text className="text-white text-base">Enable Animations</Text>

        <Pressable
          onPress={() => setEnableAnimations(!enableAnimations)}
          className="flex-row items-center"
        >
          <MaterialCommunityIcons
            name={
              enableAnimations
                ? 'toggle-switch-outline' // ✅ ON
                : 'toggle-switch-off-outline' // ❌ OFF
            }
            size={34}
            color={enableAnimations ? '#22d3ee' : '#94a3b8'}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}
