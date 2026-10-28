import { StateStorage, createJSONStorage } from "zustand/middleware";

const memoryStore = new Map<string, string>();

export const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return window.localStorage?.getItem(name) ?? memoryStore.get(name) ?? null;
    } catch {
      return memoryStore.get(name) ?? null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage?.setItem(name, value);
    } catch {
      // Fallback to memory store if quota exceeded or storage disabled in browser
      memoryStore.set(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage?.removeItem(name);
    } catch {
      memoryStore.delete(name);
    }
  },
};

export const safeJSONStorage = createJSONStorage(() => safeLocalStorage);
