import { useSettingsStore } from '@/store/settings';
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Linking,
  NativeModules,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.anonymous.batteryapp';

const { ChargingServiceModule } = NativeModules as {
  ChargingServiceModule: {
    stopService: () => void;
    startServiceIfConfigured: () => void;
  };
};

function ToggleRow({
  label,
  value,
  onToggle,
  helper,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  helper?: string;
}) {
  return (
    <View className="bg-surface rounded-xl px-4 py-4 mb-12 border border-slate-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-white text-lg font-semibold">{label}</Text>
          {!!helper && (
            <Text className="text-secondary text-xs mt-1">{helper}</Text>
          )}
        </View>
        <Pressable
          onPress={onToggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
          className="pl-3"
        >
          <MaterialCommunityIcons
            name={value ? 'toggle-switch' : 'toggle-switch-off-outline'}
            size={40}
            color={value ? '#22d3ee' : '#94a3b8'}
          />
        </Pressable>
      </View>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 flex-row items-center justify-between ${
        last ? '' : 'border-b border-slate-800'
      }`}
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-white text-base ml-3">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { enableAnimations, setEnableAnimations } = useSettingsStore();

  const handleRatePress = () => {
    Alert.alert(
      'Rate us',
      'How do you like our app?\nLet us know by leaving 5 stars on Google Play.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Rate now',
          onPress: () => {
            Linking.openURL(PLAY_STORE_URL).catch(() => {
              // Fallback (optional): show a small message if opening fails
              Alert.alert('Error', 'Could not open Google Play.');
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-4 items-center">
        <Text className="text-white text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Main toggle */}
        <ToggleRow
          label="Enable Animations"
          value={enableAnimations}
          helper="Turn off to stop the background service and disable charging animations."
          onToggle={() => {
            const next = !enableAnimations;
            setEnableAnimations(next);
            if (!next) {
              ChargingServiceModule.stopService();
            } else {
              // re-start with the last applied animation (if any)
              ChargingServiceModule.startServiceIfConfigured();
            }
          }}
        />

        {/* Actions / links */}
        <View className="bg-surface rounded-xl overflow-hidden border border-slate-800">
          <LinkRow
            icon={<Entypo name="share" size={18} color="#22d3ee" />}
            label="Share"
            onPress={() => console.log('Share Pressed')}
          />
          <LinkRow
            icon={<Ionicons name="star-outline" size={18} color="#22d3ee" />}
            label="Rate"
            onPress={handleRatePress}
          />
          <LinkRow
            icon={<Feather name="file-text" size={18} color="#22d3ee" />}
            label="Privacy Policy"
            onPress={() =>
              Linking.openURL(
                'https://waqarkhan424.github.io/battery-legal/privacy.html'
              )
            }
          />
          <LinkRow
            icon={<Feather name="file" size={18} color="#22d3ee" />}
            label="Terms & Conditions"
            onPress={() =>
              Linking.openURL(
                'https://waqarkhan424.github.io/battery-legal/terms.html'
              )
            }
            last
          />
        </View>

        {/* Footer badge */}
        <View className="items-center mt-6">
          <Text className="text-secondary text-xs">battery-app • v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
