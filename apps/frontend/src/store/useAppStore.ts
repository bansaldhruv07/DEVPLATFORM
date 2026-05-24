import { create } from 'zustand';

interface AppState {
  serverStatus: string;
  setServerStatus: (status: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  serverStatus: 'checking...',
  setServerStatus: (status) => set({ serverStatus: status }),
}));