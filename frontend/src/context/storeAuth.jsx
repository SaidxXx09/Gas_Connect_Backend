import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      clearToken: () => set({ token: null, role: null }),
    }),
    { name: 'auth-token' }
  )
);

export default useAuthStore;