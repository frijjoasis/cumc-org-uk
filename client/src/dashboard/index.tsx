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
import { RouteConfig } from '@/types';

const Frame = () => {
  const [user, setUser] = useState(null);
  const [committee, setCommittee] = useState<{
    link: string;
    text: string;
  } | null>(null);
  const [image] = useState(sidebarImg);
  const [color] = useState<'black' | 'blue' | 'red' | 'green' | undefined>(
    'black'
  );
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const getBrandText = (pathname: string) => {
    const activeRoute = routes.find((route: RouteConfig) => {
      if (!route.category && route.path && route.layout !== undefined) {
        return pathname.includes(route.layout + route.path);
      }
      return false;
    });

    return activeRoute ? activeRoute.name : '404';
  };

  const brandText = getBrandText(location.pathname);

  useEffect(() => {
    axios
      .get('/api/user/')
      .then(res => setUser(res.data.user))
      .catch(err =>
        console.log('User not authenticated:', err.response?.status)
      );

    axios
      .get('/api/member/committee')
      .then(res => {
        if (res.data && res.data.isCommittee) {
          setCommittee({ link: '/committee/home', text: 'Committee' });
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

      <Sidebar
        routes={routes}
        color={color}
        image={image}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div
        id="main-panel"
        className="relative flex flex-1 overflow-y-auto flex-col overflow-hidden"
      >
        <Header
          routes={routes}
          user={user}
          committee={committee}
          brandText={brandText}
          setIsOpen={setIsOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
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
