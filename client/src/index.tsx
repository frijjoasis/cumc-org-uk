import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Frame from './dashboard';
import Admin from './committee';

import '@/assets/css/legallists.css';
import '@/assets/css/pe-icon-7-stroke.css';
import '@/index.css';

const LoginRedirect = () => {
  window.location.href = '/api/auth/login';
  return null;
};

const DevLoginRedirect = () => {
  window.location.href = '/api/auth/dev-login';
  return null;
};

const AltLoginRedirect = () => {
  window.location.href = '/api/auth/login/other';
  return null;
};

const LogoutRedirect = () => {
  window.location.href = '/api/auth/logout';
  return null;
};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginRedirect />} />
        {import.meta.env.MODE === 'development' && (
          <Route path="/login/dev" element={<DevLoginRedirect />} />
        )}
        <Route path="/login/other" element={<AltLoginRedirect />} />
        <Route path="/logout" element={<LogoutRedirect />} />
        <Route path="/committee/*" element={<Admin />} />
        <Route path="/*" element={<Frame />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
