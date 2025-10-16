import React from 'react';
import axios from 'axios';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import routes from './routes';
import links from '../dashboard/routes';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import NotFound from '../404';

import image from '../assets/img/sidebar/sidebarCommittee.jpg';
import { Member, User } from '@/types/models';

interface AdminState {
  color: string;
  image: string;
  member?: Member;
  user?: User;
}

class Admin extends React.Component<{}, AdminState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      color: 'black',
      image: image,
    };
  }

  getBrandText(pathname: string): string {
    for (let route of routes) {
      if (pathname.includes(route.layout + route.path)) {
        return route.name; // First matching path
      }
    }
    return '404';
  }

  componentDidMount() {
    axios.get('/api/member/').then(res => {
      this.setState({
        member: res.data.member,
      });
    });
    axios.get('/api/user/').then(res => {
      this.setState({
        user: res.data.user,
      });
    });
  }

  render() {
    return <AdminContent state={this.state} getBrandText={this.getBrandText} />;
  }
}

interface AdminContentProps {
  state: AdminState;
  getBrandText: (pathname: string) => string;
}

function AdminContent({ state, getBrandText }: AdminContentProps) {
  const location = useLocation();
  const brandText = getBrandText(location.pathname);
  const isCommittee = state.member && state.member.committee;

  return (
    <div className="wrapper">
      <HelmetProvider>
        <Helmet>
          <title>{`Committee ${brandText}`}</title>
        </Helmet>
      </HelmetProvider>
      <Sidebar
        routes={isCommittee ? routes : links}
        color={state.color}
        image={state.image}
      />
      <div id="main-panel" className="main-panel">
        <Header
          routes={isCommittee ? routes : links}
          user={state.user}
          committee={
            isCommittee ? { link: '/home', text: 'Public Site' } : null
          }
          brandText={brandText}
        />
        <Routes>
          {routes.map((prop, key) => {
            if (!prop.category && isCommittee) {
              return (
                <Route
                  path={prop.layout + prop.path}
                  element={
                    <prop.Component user={state.user} member={state.member} />
                  }
                  key={key}
                />
              );
            } else return null;
          })}
          <Route
            path="/committee"
            element={<Navigate to="/committee/home" replace />}
          />
          <Route path="/committee/*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default Admin;
