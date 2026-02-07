import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user: user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'userStorage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
