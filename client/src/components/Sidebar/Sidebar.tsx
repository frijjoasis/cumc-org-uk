import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logo from '../../assets/img/logo.png';

function Sidebar({ routes, color, image }) {
  const colorOverlays = {
    black: 'bg-black/80',
    blue: 'bg-blue-900/75',
    red: 'bg-red-900/75',
    green: 'bg-green-900/75',
  };

  const activeColor = colorOverlays[color] || colorOverlays.black;

  return (
    <div className="relative hidden md:flex h-full w-64 flex-col overflow-hidden border-r text-white shadow-xl shrink-0">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Color Overlay */}
      <div className={cn('absolute inset-0 z-10 opacity-90', activeColor)} />

      {/* Content Layer */}
      <div className="relative z-20 flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-white/20 px-6">
          <NavLink
            to="/home"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 shadow-lg">
              <img
                src={logo}
                alt="CUMC logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-extrabold tracking-wider uppercase">
              CUMC
            </span>
          </NavLink>
        </div>

        {/* Navigation Wrapper */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <ul className="space-y-2">
            {routes.map((prop, key) => {
              if (prop.category) {
                return (
                  <li key={key} className="mb-2 ml-4 mt-6">
                    <p className="text-[11px] font-black tracking-[0.25em] text-white uppercase">
                      {prop.name}
                    </p>
                  </li>
                );
              }

              if (!prop.hide) {
                return (
                  <li key={key}>
                    <NavLink
                      to={prop.layout + prop.path}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-4 rounded-md px-4 py-3 text-sm transition-all duration-200',
                          isActive
                            ? 'bg-white/25 text-white font-bold shadow-lg backdrop-blur-md'
                            : 'text-white/90 font-semibold hover:bg-white/15 hover:text-white'
                        )
                      }
                    >
                      <i className={cn(prop.icon, 'w-6 text-center text-xl')} />
                      <span className="tracking-wide">{prop.name}</span>
                    </NavLink>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
