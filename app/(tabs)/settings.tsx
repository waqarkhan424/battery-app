// FILE: app/(tabs)/settings.tsx
import { useSettingsStore } from '@/store/settings';
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Linking,
  NativeModules,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { ChargingServiceModule } = NativeModules;

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
    <View className="bg-surface/80 border border-white/10 rounded-2xl px-4 py-3.5 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-white text-base font-medium">{label}</Text>
          {!!helper && (
            <Text className="text-slate-400 text-xs mt-1">{helper}</Text>
          )}
        </View>
        <Pressable
          onPress={onToggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
          className="pl-3"
        >
          <MaterialCommunityIcons
            name={value ? 'toggle-switch-outline' : 'toggle-switch-off-outline'}
            size={36}
            color={value ? '#22d3ee' : '#94a3b8'}
          />
        </Pressable>
      </View>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-3 items-center"
    >
      <View className="w-10 h-10 rounded-2xl bg-cyan-400/15 items-center justify-center">
        {icon}
      </View>
      <Text className="text-white text-sm mt-2">{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { enableAnimations, setEnableAnimations } = useSettingsStore();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Glassy header */}
      <View className="px-4 pt-2 pb-3">
        <BlurView intensity={30} tint="dark" className="rounded-2xl overflow-hidden">
          <View className="px-4 py-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-cyan-400/20 items-center justify-center mr-2">
                <Ionicons name="settings-outline" size={18} color="#22d3ee" />
              </View>
              <View>
                <Text className="text-white text-lg font-semibold">Settings</Text>
                <Text className="text-secondary text-xs">Customize your experience</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Toggles */}
        <ToggleRow
          label="Enable Animations"
          value={enableAnimations}
          helper="When off, background service is stopped and charging animations won’t play."
          onToggle={() => {
            const next = !enableAnimations;
            setEnableAnimations(next);
            if (!next) ChargingServiceModule.stopService();
          }}
        />

        {/* Quick actions */}
        <View className="mt-1 mb-4">
          <Text className="text-secondary text-xs mb-2">Quick actions</Text>
          <View className="flex-row gap-3">
            <ActionTile
              icon={<Entypo name="share" size={18} color="#22d3ee" />}
              label="Share"
              onPress={() => console.log('Share Pressed')}
            />
            <ActionTile
              icon={<Ionicons name="star-outline" size={18} color="#22d3ee" />}
              label="Rate"
              onPress={() => console.log('Rate Pressed')}
            />
            <ActionTile
              icon={<Feather name="file-text" size={18} color="#22d3ee" />}
              label="Privacy"
              onPress={() => Linking.openURL('https://www.example.com/privacy')}
            />
          </View>
        </View>

        {/* Legal / links card */}
        <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <Pressable
            onPress={() => Linking.openURL('https://www.example.com/terms')}
            className="px-4 py-3 flex-row items-center justify-between border-b border-white/10"
          >
            <View className="flex-row items-center">
              <Feather name="file" size={18} color="#22d3ee" />
              <Text className="text-white text-base ml-2">Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>

          <View className="px-4 py-3">
            <Text className="text-slate-400 text-[11px] leading-4">
              Need help? Check the privacy and terms pages for details on data
              use, licensing, and more.
            </Text>
          </View>
        </View>

        {/* App badge */}
        <View className="items-center mt-6 opacity-80">
          <View className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Text className="text-slate-300 text-xs">
              battery-app • v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
