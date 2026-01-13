import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import routes from './routes';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import NotFound from '../404';

import sidebarImg from '@/assets/img/sidebar/sidebar.jpg';

const Frame = () => {
  const [user, setUser] = useState(null);
  const [committee, setCommittee] = useState(null);
  const [image] = useState(sidebarImg);
  const [color] = useState('black');

  const location = useLocation();

  // Helper to get current page title from routes
  const getBrandText = (pathname: string) => {
    for (let route of routes) {
      if (pathname.includes(route.layout + route.path)) {
        return route.name;
      }
    }
    return '404';
  };

  const brandText = getBrandText(location.pathname);

  useEffect(() => {
    // Fetch User Authentication
    axios
      .get('/api/user/')
      .then(res => setUser(res.data.user))
      .catch(err =>
        console.log('User not authenticated:', err.response?.status)
      );

    // Check Committee Status
    axios
      .get('/api/member/committee')
      .then(res => {
        if (res.data) {
          setCommittee({
            link: '/committee/home',
            text: 'Committee',
          });
        }
      })
      .catch(err =>
        console.log('Not a committee member:', err.response?.status)
      );
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <HelmetProvider>
        <Helmet>
          <title>{`CUMC ${brandText}`}</title>
        </Helmet>
      </HelmetProvider>

      {/* 1. Sidebar - Fixed width, handled by its own component */}
      <Sidebar routes={routes} color={color} image={image} />

      {/* 2. Main Panel - flex-1 expands to fill remaining width */}
      <div
        id="main-panel"
        className="relative flex flex-1 overflow-y-auto flex-col overflow-hidden"
      >
        {/* Navbar / Header */}
        <Header
          routes={routes}
          user={user}
          committee={committee}
          brandText={brandText}
        />

        {/* 3. Scrollable Content Area */}
        <main className="flex-1 p-4 pb-0 md:pb-0 lg:pb-0 md:p-6 lg:p-8">
          <div className="mx-auto min-h-[calc(100vh-160px)] max-w-7xl">
            <Routes>
              {routes.map((prop, key) => {
                if (!prop.category && ((prop.auth && user) || !prop.auth)) {
                  return (
                    <Route
                      path={prop.layout + prop.path}
                      element={<prop.Component user={user} />}
                      key={key}
                    />
                  );
                }
                return null;
              })}

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Frame;
