import { create } from 'zustand';

type SettingsState = {
  enableAnimations: boolean;
  hideBatteryPercentage: boolean;
  keepServiceAlive: boolean;
  overlayPermissionEnabled: boolean;

  setEnableAnimations: (value: boolean) => void;
  setHideBatteryPercentage: (value: boolean) => void;
  setKeepServiceAlive: (value: boolean) => void;
  setOverlayPermissionEnabled: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  enableAnimations: true,                //  default ON
  hideBatteryPercentage: false,
  keepServiceAlive: false,
  overlayPermissionEnabled: false,

  setEnableAnimations: (value) => set({ enableAnimations: value }),
  setHideBatteryPercentage: (value) => set({ hideBatteryPercentage: value }),
  setKeepServiceAlive: (value) => set({ keepServiceAlive: value }),
  setOverlayPermissionEnabled: (value) => set({ overlayPermissionEnabled: value }),
}));
