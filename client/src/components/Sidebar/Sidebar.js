import React from 'react';
import {NavLink} from 'react-router-dom';

import logo from '../../assets/img/logo.png';

class Sidebar extends React.Component {
  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    return this.props.location.pathname.includes(routeName) ? "active" : "";
  }

  render() {
    const sidebarBackground = {
      backgroundImage: "url(" + this.props.image + ")"
    };
    return (
      <div
          id="sidebar"
          className="sidebar"
          data-color={this.props.color}
          data-image={this.props.image}
      >
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
          <ul className="nav" >
            {this.props.routes.map((prop, key) => {
              if (prop.category) {
                return (
                    <li key={key}>
                      <p>{prop.name}</p>
                    </li>
                )
              } else if (!prop.hide) {
                return (
                    <li
                        className={this.activeRoute(prop.layout + prop.path)}
                        key={key}
                    >
                      <NavLink
                          to={prop.layout + prop.path}
                          className="nav-link"
                          activeClassName="active"
                      >
                        <i className={prop.icon}/>
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
}

export default Sidebar;