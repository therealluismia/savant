import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeParseJson } from '@/utils';

/**
 * A typed wrapper around AsyncStorage for storing structured data.
 */
export const storageService = {
  set: async <T>(key: string, value: T): Promise<void> => {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  },

  get: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return safeParseJson<T>(raw);
  },

  remove: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
