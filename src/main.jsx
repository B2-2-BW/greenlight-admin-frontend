import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router';
import { Toast } from '@heroui/react';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toast.Provider placement="top end" />
    <App />
  </BrowserRouter>
);
