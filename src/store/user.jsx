import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (username) => set(() => ({ user: username })),
    }),
    {
      name: 'userStorage',
    }
  )
);
