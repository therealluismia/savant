import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import type { ThemeMode } from '@/types';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'system',

  setMode: async (mode: ThemeMode) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, mode);
    set({ mode });
  },

  initialize: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      set({ mode: stored });
    }
  },
}));
