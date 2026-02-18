import './App.css';
import { Navigate, Route, Routes } from 'react-router';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import MainLayout from './layout/MainLayout.jsx';
import NotFoundPage from './page/NotFoundPage.jsx';
import LoginPage from './page/LoginPage.jsx';
import DashboardPage from './page/DashboardPage.jsx';
import PrivateRoute from './router/PrivateRoute.jsx';
import ActionGroupPage from './page/ActionGroupPage.jsx';
import ActionGroupDetailPage from './page/ActionGroupDetailPage.jsx';
import BadRequestPage from './page/BadRequestPage.jsx';
import SomethingWentWrongPage from './page/SomethingWentWrongPage.jsx';
import SystemSettingsPage from './page/SystemSettingsPage.jsx';
import SchedulerPage from './page/SchedulerPage.jsx';
import UserManagementPage from './page/UserManagementPage.jsx';
import SigninPage from './page/SigninPage.jsx';
import RoomListPage from './page/RoomListPage.jsx';
import RoomDetailPage from './page/RoomDetailPage.jsx';
import DashboardV2Page from './page/DashboardV2Page.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/new" element={<DashboardV2Page />} />
          <Route path="/action-groups" element={<ActionGroupPage />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/rooms/new" element={<RoomDetailPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="/action-groups/new" element={<ActionGroupDetailPage />} />
          <Route path="/action-groups/:actionGroupId" element={<ActionGroupDetailPage />} />
          <Route path="/schedulers" element={<SchedulerPage />} />
          <Route path="/settings" element={<SystemSettingsPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/notfound" element={<NotFoundPage />} />
          <Route path="/forbidden" element={<BadRequestPage />} />
          <Route path="/opps" element={<SomethingWentWrongPage />} />
          <Route path="*" element={<BadRequestPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
