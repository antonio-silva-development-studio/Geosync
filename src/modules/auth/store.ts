import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  masterKey: string | null;
  userProfile: { name: string; email: string } | null;
  authMethod: 'password' | 'biometric' | null;

  setAuthenticated: (
    key: string,
    method: 'password' | 'biometric',
    user?: { name: string; email: string },
  ) => void;
  setUserProfile: (profile: { name: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  masterKey: null,
  userProfile: null,
  authMethod: null,

  setAuthenticated: (key, method, user) =>
    set({
      isAuthenticated: true,
      masterKey: key,
      authMethod: method,
      userProfile: user || null,
    }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  logout: () =>
    set({
      isAuthenticated: false,
      masterKey: null,
      authMethod: null,
      userProfile: null,
    }),
}));
