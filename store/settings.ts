import { create } from 'zustand';

type SettingsState = {
  enableAnimations: boolean;
  setEnableAnimations: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  enableAnimations: true, // ✅ default = ON
  setEnableAnimations: (value) => set({ enableAnimations: value }),
}));
