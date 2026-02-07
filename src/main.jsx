import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';
import { ToastProvider } from '@heroui/toast';
import { HeroUIProvider } from '@heroui/react';

createRoot(document.getElementById('root')).render(
  <HeroUIProvider locale="ko-KR">
    <BrowserRouter>
      <ToastProvider placement="top-right" toastOffset={60} />
      <App />
    </BrowserRouter>
  </HeroUIProvider>
);
