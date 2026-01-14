import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '../../assets/img/logo.png';

const Navigation = ({ routes, image, color = 'black', isOpen, setIsOpen }) => {
  const colorOverlays = {
    black: 'bg-black/80',
    blue: 'bg-blue-900/75',
    red: 'bg-red-900/75',
    green: 'bg-green-900/75',
  };

  const NavItems = ({ isMobile = false }) => (
    <ul className="space-y-2 mt-4">
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
        if (prop.hide) return null;

        return (
          <li key={key}>
            <NavLink
              to={prop.layout + prop.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-4 rounded-md px-4 py-3 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white/20 text-white font-bold shadow-lg backdrop-blur-md'
                    : 'text-white/70 font-semibold hover:bg-white/10 hover:text-white'
                )
              }
            >
              <i className={cn(prop.icon, 'w-6 text-center text-xl')} />
              <span className="tracking-wide">{prop.name}</span>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="relative hidden md:flex h-full w-64 flex-col overflow-hidden border-r text-white shadow-xl shrink-0">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
        <div className={cn('absolute inset-0 z-10 opacity-95', colorOverlays[color])} />
        <div className="relative z-20 flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-white/10 px-6">
             <LogoSection />
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-6">
            <NavItems />
          </div>
        </div>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 border-none w-72">
          <div className="relative h-full w-full flex flex-col text-white">
             <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
             <div className={cn('absolute inset-0 z-10 opacity-95', colorOverlays[color])} />
             <div className="relative z-20 flex h-full flex-col">
                <div className="flex h-16 items-center border-b border-white/10 px-6">
                   <LogoSection />
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-6">
                  <NavItems isMobile />
                </div>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const LogoSection = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-1">
      <img src={logo} alt="logo" className="h-full w-full object-contain" />
    </div>
    <span className="text-lg font-black tracking-widest uppercase">CUMC</span>
  </div>
);

export default Navigation;