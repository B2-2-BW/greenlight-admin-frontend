import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';
import { Toast } from '@heroui/react';
import { CookiesProvider } from 'react-cookie';

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('aria-label or aria-labelledby')) {
    return; // 해당 경고만 무시
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toast.Provider placement="top end" className="admin-toast-region" />
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <App />
    </CookiesProvider>
  </BrowserRouter>
);
