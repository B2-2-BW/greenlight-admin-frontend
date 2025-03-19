import './App.css';
import { Navigate, Route, Routes } from 'react-router';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import EventPage from './page/EventPage.jsx';
import MainLayout from './layout/MainLayout.jsx';
import EventDetailPage from './page/EventDetailPage.jsx';
import NotFoundPage from './page/404ErrorPage.jsx';
import LoginPage from './page/LoginPage.jsx';
import EventCreatePage from './page/EventCreatePage.jsx';
import DashboardPage from './page/DashboardPage.jsx';
import PrivateRoute from './router/PrivateRoute.jsx';

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
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HeroUIProvider>
    </>
  );
}

export default App;
