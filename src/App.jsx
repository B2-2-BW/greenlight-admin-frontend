import './App.css';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import MainLayout from './layout/MainLayout.jsx';
import NotFoundPage from './page/NotFoundPage.jsx';
import LoginPage from './page/LoginPage.jsx';
import PrivateRoute from './router/PrivateRoute.jsx';
import BadRequestPage from './page/BadRequestPage.jsx';
import SomethingWentWrongPage from './page/SomethingWentWrongPage.jsx';
import SiteSettingsPage from './page/SiteSettingsPage.jsx';
import SchedulerPage from './page/SchedulerPage.jsx';
import UserManagementPage from './page/UserManagementPage.jsx';
import SigninPage from './page/SigninPage.jsx';
import RoomListPage from './page/RoomListPage.jsx';
import RoomDetailPage from './page/RoomDetailPage.jsx';
import DashboardV2Page from './page/DashboardV2Page.jsx';
import AccountPage from './page/AccountPage.jsx';
import UserDetailPage from './page/UserDetailPage.jsx';
import AdminRoute from './router/AdminRoute.jsx';
import SuperRoute from './router/SuperRoute.jsx';
import ForcedPasswordChangeDialog from './component/mypage/ForcedPasswordChangeDialog.jsx';
import SiteManagementPage from './page/SiteManagementPage.jsx';
import SiteDetailPage from './page/SiteDetailPage.jsx';
import QueueStatisticsSkeleton from './component/QueueStatisticsSkeleton.jsx';
import AuditLogPage from './page/AuditLogPage.jsx';

const QueueStatisticsPage = lazy(() => import('./page/QueueStatisticsPage.jsx'));

function App() {
  return (
    <>
      <ForcedPasswordChangeDialog />
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
          {/*<Route path="/dashboard" element={<DashboardPage />} />*/}
          <Route path="/dashboard" element={<DashboardV2Page />} />
          <Route
            path="/queue-statistics"
            element={(
              <Suspense fallback={<QueueStatisticsSkeleton />}>
                <QueueStatisticsPage />
              </Suspense>
            )}
          />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route
            path="/rooms/new"
            element={
              <AdminRoute>
                <RoomDetailPage />
              </AdminRoute>
            }
          />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route
            path="/system-status"
            element={
              <SuperRoute>
                <SchedulerPage />
              </SuperRoute>
            }
          />
          <Route path="/schedulers" element={<Navigate to="/system-status" replace />} />
          <Route path="/settings" element={<SiteSettingsPage />} />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <AdminRoute>
                <UserDetailPage />
              </AdminRoute>
            }
          />
          <Route
            path="/sites"
            element={
              <SuperRoute>
                <SiteManagementPage />
              </SuperRoute>
            }
          />
          <Route
            path="/sites/:siteId"
            element={
              <SuperRoute>
                <SiteDetailPage />
              </SuperRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <AdminRoute>
                <AuditLogPage />
              </AdminRoute>
            }
          />
          <Route path="/account" element={<AccountPage />} />
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
