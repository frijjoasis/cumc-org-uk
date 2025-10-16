import React from 'react';
import ReactDOM from 'react-dom/client';
import Frame from './dashboard';
import Admin from './committee';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import '@/assets/css/animate.min.css';
import '@/assets/css/legallists.css';
import '@/assets/sass/light-bootstrap-dashboard-react.scss';
import '@/assets/css/pe-icon-7-stroke.css';

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
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
