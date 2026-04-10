import { createContext, useContext } from 'react';

const DashboardContext = createContext(null);

export const useDashboard = () => useContext(DashboardContext);
export default DashboardContext;
