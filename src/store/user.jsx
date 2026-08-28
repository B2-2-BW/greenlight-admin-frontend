import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getAccessibleSiteIds, getEffectiveSiteId } from '../util/siteUtil.js';

export const useUserStore = create(
  persist(
    (set) => ({
      user: {},
      selectedSiteId: null,
      setUser: (user) =>
        set((state) => {
          const isSameUser = state.user?.userId && state.user.userId === user?.userId;
          const accessible = getAccessibleSiteIds(user);
          const role = user?.userRole ?? user?.role;
          const previousSelected = isSameUser ? state.selectedSiteId : null;
          const selectedSiteId =
            role === 'SUPER' || accessible.includes(previousSelected)
              ? previousSelected || getEffectiveSiteId(user, previousSelected)
              : getEffectiveSiteId(user, null);
          return {
            user,
            selectedSiteId,
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
