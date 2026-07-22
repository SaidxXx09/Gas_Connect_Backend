import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      user: null,
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),
      setUser: (user) => set({ user, role: user?.role || null }),
      setAuth: ({ token, ...user }) => set({ token, user, role: user?.role || null }),
      clearToken: () => set({ token: null, role: null, user: null }),
    }),
    { name: 'auth-token' },
  ),
);

export default useAuthStore;
