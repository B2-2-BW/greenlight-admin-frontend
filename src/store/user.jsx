import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: {},
      selectedSiteId: null,
      setUser: (user) =>
        set((state) => {
          const role = user?.userRole ?? user?.role;
          const isSameUser = state.user?.userId && state.user.userId === user?.userId;
          return {
            user,
            selectedSiteId:
              role === 'SUPER' ? (isSameUser ? state.selectedSiteId : null) || user?.siteId || null : null,
          };
        }),
      setSelectedSiteId: (selectedSiteId) => set({ selectedSiteId }),
      clearUser: () => set({ user: {}, selectedSiteId: null }),
    }),
    {
      name: 'userStorage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
