import React from 'react';
import { NavLink } from 'react-router-dom';

import logo from '../../assets/img/logo.png';

function Sidebar({ routes, color, image }) {
  const sidebarBackground = {
    backgroundImage: 'url(' + image + ')',
  };

  return (
    <div id="sidebar" className="sidebar" data-color={color} data-image={image}>
      <div className="sidebar-background" style={sidebarBackground} />
      <div className="logo">
        <NavLink to="/home" className="simple-text logo-mini">
          <div className="logo-img">
            <img src={logo} alt="react-logo" />
          </div>
        </NavLink>

        <NavLink className="simple-text logo-normal" to="/home">
          CUMC
        </NavLink>
      </div>
      <div className="sidebar-wrapper">
        <ul className="nav">
          {routes.map((prop, key) => {
            if (prop.category) {
              return (
                <li key={key}>
                  <p>{prop.name}</p>
                </li>
              );
            } else if (!prop.hide) {
              return (
                <li key={key}>
                  <NavLink
                    to={prop.layout + prop.path}
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            } else return null;
          })}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
