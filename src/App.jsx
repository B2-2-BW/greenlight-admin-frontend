import './App.css';
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
          {/*<Route path="/dashboard" element={<DashboardPage />} />*/}
          <Route path="/dashboard" element={<DashboardV2Page />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/rooms/new" element={<RoomDetailPage />} />
          <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="/schedulers" element={<SchedulerPage />} />
          <Route path="/settings" element={<SiteSettingsPage />} />
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
