import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import logo from '../../assets/img/logo.png';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { RouteConfig } from '@/types';

interface SideProps {
  routes: RouteConfig[];
  image: string;
  color?: 'black' | 'blue' | 'red' | 'green';
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function Sidebar({ routes, color, image, isOpen, setIsOpen }: SideProps) {
  const colorOverlays = {
    black: 'bg-black/80',
    blue: 'bg-blue-900/75',
    red: 'bg-red-900/75',
    green: 'bg-green-900/75',
  };

  const activeColor = color ? colorOverlays[color] : colorOverlays.black;

  const SidebarContent = ({ isMobile = false }) => (
    <div className="relative z-20 flex h-full flex-col text-white">
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b border-white/20 px-6">
        <NavLink to="/home" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 shadow-lg">
            <img
              src={logo}
              alt="logo"
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
                  <p className="text-[11px] font-black tracking-[0.25em] text-white/50 uppercase">
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
                    onClick={() => isMobile && setIsOpen(false)}
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
  );
  return (
    <>
      {/* DESKTOP VERSION */}
      <div className="relative hidden md:flex h-full w-64 flex-col overflow-hidden border-r text-white shadow-xl shrink-0">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className={cn('absolute inset-0 z-10 opacity-90', activeColor)} />
        <SidebarContent />
      </div>

      {/* MOBILE VERSION (DRAWER) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 border-none [&>button]:z-100 [&>button]:text-white [&>button]:opacity-70 [&>button:hover]:opacity-100"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Access main pages and committee dashboard
            </SheetDescription>
          </SheetHeader>

          <div className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
            <div
              className={cn('absolute inset-0 z-10 opacity-95', activeColor)}
            />
            <div className="relative z-20 flex h-full flex-col">
              <SidebarContent isMobile />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default Sidebar;
