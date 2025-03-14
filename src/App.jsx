import './App.css';
import { Route, Routes } from 'react-router';
import { HeroUIProvider } from '@heroui/react';
import EventPage from './page/EventPage.jsx';
import MainLayout from './layout/MainLayout.jsx';

function App() {
  return (
    <>
      <HeroUIProvider>
        {/*<EventPage />*/}
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/events" element={<EventPage />} />
          </Route>
        </Routes>
      </HeroUIProvider>
    </>
  );
}

export default App;
