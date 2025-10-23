import './App.css';
import { Navigate, Route, Routes } from 'react-router';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import EventPage from './page/EventPage.jsx';
import MainLayout from './layout/MainLayout.jsx';
import EventDetailPage from './page/EventDetailPage.jsx';
import NotFoundPage from './page/NotFoundPage.jsx';
import LoginPage from './page/LoginPage.jsx';
import EventCreatePage from './page/EventCreatePage.jsx';
import DashboardPage from './page/DashboardPage.jsx';
import PrivateRoute from './router/PrivateRoute.jsx';
import ActionGroupPage from './page/ActionGroupPage.jsx';
import ActionGroupDetailPage from './page/ActionGroupDetailPage.jsx';
import BadRequestPage from './page/BadRequestPage.jsx';
import SomethingWentWrongPage from './page/SomethingWentWrongPage.jsx';
import SystemSettingsPage from './page/SystemSettingsPage.jsx';
import SchedulerPage from './page/SchedulerPage.jsx';
import UserManagementPage from './page/UserManagementPage.jsx';

function App() {
  return (
    <>
      <HeroUIProvider locale="ko-KR">
        <ToastProvider placement="top-right" toastOffset={60} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events" element={<EventPage />} />
            <Route path="/events/new" element={<EventCreatePage />} />
            <Route path="/events/:eventName" element={<EventDetailPage />} />
            <Route path="/action-groups" element={<ActionGroupPage />} />
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
      </HeroUIProvider>
    </>
  );
}

export default App;
