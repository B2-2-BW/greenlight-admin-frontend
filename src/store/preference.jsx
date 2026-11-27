import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { normalizeDashboardSort } from '../util/dashboardSort.js';

const DEFAULT_DASHBOARD_FILTER = {
  roomEnvironment: 'LIVE',
  enabled: ['true'],
};

export const usePreferenceStore = create(
  persist(
    (set, get) => ({
      dashboardFilter: DEFAULT_DASHBOARD_FILTER,
      dashboardSort: {},
      updateDashboardFilter: (filter) => {
        const current = get().dashboardFilter;
        set({ dashboardFilter: { ...current, ...filter } });
      },
      updateDashboardSort: (key, preference) => {
        const current = get().dashboardSort;
        set({ dashboardSort: { ...current, [key]: normalizeDashboardSort({ ...current[key], ...preference }) } });
      },
    }),
    {
      name: 'preferenceStorage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState) => {
        const preferences = { ...persistedState };
        delete preferences.loginPreference;
        return preferences;
      },
      partialize: ({ dashboardFilter, dashboardSort }) => ({
        dashboardFilter,
        dashboardSort,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        dashboardFilter: { ...DEFAULT_DASHBOARD_FILTER, ...persistedState?.dashboardFilter },
        dashboardSort: Object.fromEntries(
          Object.entries(persistedState?.dashboardSort ?? {}).map(([key, value]) => [
            key,
            normalizeDashboardSort(value),
          ])
        ),
      }),
    }
  )
);
