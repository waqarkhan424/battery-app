import { useSettingsStore } from '@/store/settings';
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Linking,
  Modal,
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

  // Rating confirmation modal (no star capture)
  const [showRateModal, setShowRateModal] = useState(false);

  const openPlayStore = async () => {
    try {
      await Linking.openURL(PLAY_STORE_URL); // use HTTPS only
    } catch {
      // optional: toast/snackbar if you have one
    }
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
            onPress={() => setShowRateModal(true)}
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

      {/* Modern confirmation modal */}
      <Modal
        transparent
        visible={showRateModal}
        animationType="fade"
        onRequestClose={() => setShowRateModal(false)}
      >
        {/* Backdrop */}
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          {/* Subtle gradient frame */}
          <View className="w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-br from-cyan-400/40 via-sky-500/10 to-transparent">
            {/* Card */}
            <View className="bg-surface rounded-3xl p-6 border border-slate-800">
              {/* Icon */}
              <View className="items-center mb-2">
                <MaterialCommunityIcons
                  name="star-circle"
                  size={56}
                  color="#22d3ee"
                />
              </View>

              {/* Title */}
              <Text className="text-white text-xl font-bold text-center">
                Enjoying Battery App?
              </Text>
              <Text className="text-secondary text-sm text-center mt-1">
                Let us know by leaving a 5-star review on Google Play.
              </Text>

              {/* Buttons */}
              <View className="mt-6 gap-3">
                <Pressable
                  onPress={async () => {
                    setShowRateModal(false);
                    await openPlayStore();
                  }}
                  className="bg-cyan-400 rounded-2xl py-3 items-center active:opacity-90"
                >
                  <Text className="text-slate-900 font-semibold">
                    Rate on Play Store
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowRateModal(false)}
                  className="bg-transparent border border-slate-700 rounded-2xl py-3 items-center active:opacity-80"
                >
                  <Text className="text-secondary">Maybe later</Text>
                </Pressable>
              </View>

              {/* Tiny note */}
              <Text className="text-[11px] text-secondary text-center mt-3">
                You’ll pick your rating on Google Play after this step.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
