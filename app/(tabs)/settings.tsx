import { useSettingsStore } from '@/store/settings';
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Linking, NativeModules, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { ChargingServiceModule } = NativeModules;

export default function SettingsScreen() {
  const {
    enableAnimations,
    setEnableAnimations,
  } = useSettingsStore();

  const ToggleRow = ({
    label,
    value,
    onToggle,
  }: {
    label: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View className="flex-row justify-between items-center bg-surface p-4 rounded-lg mb-4">
      <Text className="text-white text-base">{label}</Text>
      <Pressable onPress={onToggle}>
        <MaterialCommunityIcons
          name={value ? 'toggle-switch-outline' : 'toggle-switch-off-outline'}
          size={34}
          color={value ? '#22d3ee' : '#94a3b8'}
        />
      </Pressable>
    </View>
  );

  const LinkRow = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-surface px-4 py-3 rounded-lg mb-3"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-white text-base ml-3">{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 bg-background border-surface">
        <Text className="text-white text-2xl font-bold text-center">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Kept: Enable Animations */}
        <ToggleRow
          label="Enable Animations"
          value={enableAnimations}
          onToggle={() => {
            const newValue = !enableAnimations;
            setEnableAnimations(newValue);
            // Only stop service when disabling animations
            if (!newValue) {
              ChargingServiceModule.stopService();
            }
          }}
        />

        {/* Removed:
            - Hide battery percentage
            - Keep service always alive
            - Overlay permission enabled
        */}

        {/* Links */}
        <LinkRow
          icon={<Entypo name="share" size={22} color="#22d3ee" />}
          label="Share"
          onPress={() => console.log('Share Pressed')}
        />
        <LinkRow
          icon={<Ionicons name="star-outline" size={22} color="#22d3ee" />}
          label="Rate"
          onPress={() => console.log('Rate Pressed')}
        />
        <LinkRow
          icon={<Feather name="file-text" size={22} color="#22d3ee" />}
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://www.example.com/privacy')}
        />
        <LinkRow
          icon={<Feather name="file" size={22} color="#22d3ee" />}
          label="Terms & Conditions"
          onPress={() => Linking.openURL('https://www.example.com/terms')}
        />

        {/* Removed Support link (was a no-op). */}
      </ScrollView>
    </SafeAreaView>
  );
}
