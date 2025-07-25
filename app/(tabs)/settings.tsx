import { useSettingsStore } from '@/store/settings';
import { ScrollView, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { enableAnimations, setEnableAnimations } = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-white text-2xl font-bold mb-6 text-center">Settings</Text>

      {/* Enable Animations Toggle */}
      <View className="flex-row justify-between items-center bg-surface p-4 rounded mb-4">
        <Text className="text-white text-base">Enable Animations</Text>
        <Switch
          value={enableAnimations}
          onValueChange={setEnableAnimations}
          thumbColor={enableAnimations ? '#22d3ee' : '#fff'}
          trackColor={{ false: '#475569', true: '#0e7490' }} // you can optionally create a custom 'track' color
        />
      </View>
    </ScrollView>
  );
}
