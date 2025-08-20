import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type DurationLabel = '10 seconds' | '30 seconds' | '1 minute' | 'Always';
type CloseLabel = 'Single Tap To Hide' | 'Double Tap To Hide';

type SettingsState = {
  enableAnimations: boolean;
  appliedAnimation: string | null;
  setEnableAnimations: (value: boolean) => void;
  setAppliedAnimation: (uri: string | null) => void;

  // remember last selected Apply Settings
  lastDurationLabel: DurationLabel;
  lastCloseLabel: CloseLabel;
  setLastOptions: (duration: DurationLabel, close: CloseLabel) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      enableAnimations: true,
      appliedAnimation: null,

      setEnableAnimations: (value) => set({ enableAnimations: value }),
      setAppliedAnimation: (uri) => set({ appliedAnimation: uri }),

      // Defaults match the UI defaults
      lastDurationLabel: '1 minute',
      lastCloseLabel: 'Single Tap To Hide',
      setLastOptions: (duration, close) =>
        set({ lastDurationLabel: duration, lastCloseLabel: close }),
    }),
    {
      name: 'battery-app-settings',
      // <-- IMPORTANT: use AsyncStorage in React Native
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
