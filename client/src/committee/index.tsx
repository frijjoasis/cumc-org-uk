import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import routes from './routes';
import links from '../dashboard/routes';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import NotFound from '../404';

import sidebarImg from '@/assets/img/sidebar/sidebarCommittee.jpg';
import { Member, User } from '@cumc/shared-types';
import { RouteConfig } from '@/types';

const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [image] = useState(sidebarImg);
  const [color] = useState<'black' | 'blue' | 'red' | 'green' | undefined>(
    'black'
  );
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const getBrandText = (pathname: string) => {
    const activeRoute = routes.find(
      (r: RouteConfig) => r.path && pathname.includes(r.path)
    );
    return activeRoute ? activeRoute.name : 'Admin';
  };

  const brandText = getBrandText(location.pathname);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, memberRes] = await Promise.all([
          axios.get('/api/user/'),
          axios.get('/api/member/'),
        ]);

        setUser(userRes.data.user);
        setMember(memberRes.data.member);
      } catch (err) {
        console.error('Admin Auth Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isCommittee = member && member.committee;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-zinc-400 font-black uppercase italic tracking-widest">
        Loading Dashboard...
      </div>
    );
  }

  if (!isCommittee) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50/50">
      <HelmetProvider>
        <Helmet>
          <title>{`Committee | ${brandText}`}</title>
        </Helmet>
      </HelmetProvider>

      <Sidebar
        routes={isCommittee ? routes : links}
        color={color}
        image={image}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* 2. Main Panel */}
      <div
        id="main-panel"
        className="relative flex flex-1 overflow-y-auto flex-col overflow-hidden border-l border-zinc-200"
      >
        <Header
          routes={isCommittee ? routes : links}
          user={user}
          committee={{ link: '/home', text: 'Public Site' }}
          brandText={brandText}
          setIsOpen={setIsOpen}
        />

        {/* 3. Scrollable Content Area with Flex constraints */}
        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto min-h-[calc(100vh-200px)] max-w-7xl">
            <Routes>
              {routes.map((prop, key) => {
                if (!prop.category && prop.Component) {
                  const RouteComponent = prop.Component;

                  return (
                    <Route
                      path={prop.path}
                      key={key}
                      element={<RouteComponent user={user} member={member} />}
                    />
                  );
                }
                return null;
              })}

              <Route path="/" element={<Navigate to="home" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Admin;
