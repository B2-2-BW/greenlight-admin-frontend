import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      site: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'userStorage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
