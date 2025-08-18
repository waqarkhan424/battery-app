import { create } from 'zustand';

type SettingsState = {
  enableAnimations: boolean;
  appliedAnimation: string | null;
  setEnableAnimations: (value: boolean) => void;
  setAppliedAnimation: (uri: string | null) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  enableAnimations: true,
  appliedAnimation: null,

  setEnableAnimations: (value) => set({ enableAnimations: value }),
  setAppliedAnimation: (uri) => set({ appliedAnimation: uri }),
}));
