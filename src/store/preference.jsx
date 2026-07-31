import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const DEFAULT_DASHBOARD_FILTER = {
  roomEnvironment: 'LIVE',
  enabled: ['true'],
};

export const usePreferenceStore = create(
  persist(
    (set, get) => ({
      dashboardFilter: DEFAULT_DASHBOARD_FILTER,
      loginPreference: null,
      updateDashboardFilter: (filter) => {
        const current = get().dashboardFilter;
        set({ dashboardFilter: { ...current, ...filter } });
      },
      updateLoginPreference: (preference) => {
        const current = get().loginPreference;
        set({ loginPreference: { ...current, ...preference } });
      },
      clearLoginPreference: () => set({ loginPreference: null }),
    }),
    {
      name: 'preferenceStorage',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ dashboardFilter, loginPreference }) => ({ dashboardFilter, loginPreference }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        dashboardFilter: persistedState?.dashboardFilter ?? currentState.dashboardFilter,
        loginPreference: persistedState?.loginPreference ?? currentState.loginPreference,
      }),
    }
  )
);
