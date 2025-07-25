import { useSettingsStore } from '@/store/settings';
import { Entypo, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

export default function SettingsScreen() {
  const {
    enableAnimations,
    setEnableAnimations,
    hideBatteryPercentage,
    setHideBatteryPercentage,
    keepServiceAlive,
    setKeepServiceAlive,
    overlayPermissionEnabled,
    setOverlayPermissionEnabled,
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
    <View className="flex-row justify-between items-center bg-surface p-4 rounded mb-4">
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
      className="flex-row items-center justify-between bg-surface px-4 py-3 rounded mb-3"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-white text-base ml-3">{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-white text-2xl font-bold mb-6 text-center">Settings</Text>

      {/* Toggles */}
      <ToggleRow
        label="Enable Animations"
        value={enableAnimations}
        onToggle={() => setEnableAnimations(!enableAnimations)}
      />
      <ToggleRow
        label="Hide battery percentage"
        value={hideBatteryPercentage}
        onToggle={() => setHideBatteryPercentage(!hideBatteryPercentage)}
      />
      <ToggleRow
        label="Keep service always alive"
        value={keepServiceAlive}
        onToggle={() => setKeepServiceAlive(!keepServiceAlive)}
      />
      <ToggleRow
        label="Overlay permission enabled"
        value={overlayPermissionEnabled}
        onToggle={() => setOverlayPermissionEnabled(!overlayPermissionEnabled)}
      />

      {/* Bottom actions */}
      <LinkRow
        icon={<Entypo name="share" size={22} color="#22d3ee" />}
        label="Share"
        onPress={() => {
          // later add Share API
          console.log('Share Pressed');
        }}
      />

      <LinkRow
        icon={<Ionicons name="star-outline" size={22} color="#22d3ee" />}
        label="Rate"
        onPress={() => {
          // later add Play Store link
          console.log('Rate Pressed');
        }}
      />

      <LinkRow
        icon={<Feather name="file-text" size={22} color="#22d3ee" />}
        label="Privacy Policy"
        onPress={() => {
          // replace with your link later
          Linking.openURL('https://www.example.com/privacy');
        }}
      />

      <LinkRow
        icon={<Feather name="file" size={22} color="#22d3ee" />}
        label="Terms & Conditions"
        onPress={() => {
          // replace with your link later
          Linking.openURL('https://www.example.com/terms');
        }}
      />

      <LinkRow
        icon={<Feather name="headphones" size={22} color="#22d3ee" />}
        label="Support"
        onPress={() => {
          // replace with your contact method later
          console.log('Support Pressed');
        }}
      />
    </ScrollView>
  );
}
