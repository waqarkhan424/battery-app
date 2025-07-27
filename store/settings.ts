import { create } from 'zustand';

type SettingsState = {
  enableAnimations: boolean;
  hideBatteryPercentage: boolean;
  keepServiceAlive: boolean;
  overlayPermissionEnabled: boolean;
  appliedAnimation: string | null;
  setEnableAnimations: (value: boolean) => void;
  setHideBatteryPercentage: (value: boolean) => void;
  setKeepServiceAlive: (value: boolean) => void;
  setOverlayPermissionEnabled: (value: boolean) => void;
  setAppliedAnimation: (uri: string | null) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  enableAnimations: true,
  hideBatteryPercentage: false,
  keepServiceAlive: false,
  overlayPermissionEnabled: false,
  appliedAnimation: null,

  setEnableAnimations: (value) => set({ enableAnimations: value }),
  setHideBatteryPercentage: (value) => set({ hideBatteryPercentage: value }),
  setKeepServiceAlive: (value) => set({ keepServiceAlive: value }),
  setOverlayPermissionEnabled: (value) => set({ overlayPermissionEnabled: value }),
  setAppliedAnimation: (uri) => set({ appliedAnimation: uri }),
}));
