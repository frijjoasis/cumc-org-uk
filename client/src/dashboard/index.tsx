import React from 'react';
import axios from 'axios';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import routes from './routes';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import NotFound from '../404';

import sidebarImg from '@assets/img/sidebar/sidebar.jpg';

class Frame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 'black',
      image: sidebarImg,
    };
  }

  getBrandText(pathname) {
    for (let route of routes) {
      if (pathname.includes(route.layout + route.path)) {
        return route.name; // First matching path
      }
    }
    return '404';
  }

  componentDidMount() {
    axios
      .get('/api/user/')
      .then(res => {
        this.setState({
          user: res.data.user,
        });
      })
      .catch(err => {
        console.log('User not authenticated:', err.response?.status);
        // User not logged in, which is fine
      });

    axios
      .get('/api/member/committee')
      .then(res => {
        if (res.data) {
          this.setState({
            committee: {
              link: '/committee/home',
              text: 'Committee',
            },
          });
        }
      })
      .catch(err => {
        console.log('Not a committee member:', err.response?.status);
        // User not in committee, which is fine
      });
  }

  render() {
    return <FrameContent state={this.state} getBrandText={this.getBrandText} />;
  }
}

function FrameContent({ state, getBrandText }) {
  const location = useLocation();
  const brandText = getBrandText(location.pathname);

  return (
    <div className="wrapper">
      <HelmetProvider>
        <Helmet>
          <title>{`CUMC ${brandText}`}</title>
        </Helmet>
      </HelmetProvider>
      <Sidebar routes={routes} color={state.color} image={state.image} />
      <div id="main-panel" className="main-panel">
        <Header
          routes={routes}
          user={state.user}
          committee={state.committee}
          brandText={brandText}
        />
        <Routes>
          {routes.map((prop, key) => {
            if (!prop.category && ((prop.auth && state.user) || !prop.auth)) {
              return (
                <Route
                  path={prop.layout + prop.path}
                  element={<prop.Component user={state.user} />}
                  key={key}
                />
              );
            } else return null;
          })}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default Frame;
