import './App.css';
import { Route, Routes } from 'react-router';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import EventPage from './page/EventPage.jsx';
import MainLayout from './layout/MainLayout.jsx';
import EventDetailPage from './page/EventDetailPage.jsx';

function App() {
  return (
    <>
      <HeroUIProvider locale="ko-KR">
        <ToastProvider placement="top-right" toastOffset={60} />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/events" element={<EventPage />} />
            <Route path="/events/:eventName" element={<EventDetailPage />} />
          </Route>
        </Routes>
      </HeroUIProvider>
    </>
  );
}

export default App;
