import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface HeaderProps {
  routes: any[];
  user: any;
  committee?: { link: string; text: string } | null;
  brandText: string;
  setIsOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  routes,
  user,
  committee,
  brandText,
  setIsOpen,
}) => {
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await axios.post('/api/auth/logout');
      window.localStorage.clear();
      navigate('/home');
      window.location.reload();
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/home');
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-primary',
      isActive ? 'text-black dark:text-white' : 'text-muted-foreground'
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/" className=" font-black tracking-tighter text-xl">
            {brandText}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {committee && (
              <NavLink to={committee.link} className={navLinkClass}>
                {committee.text}
              </NavLink>
            )}
            {/* Filter and map routes if needed on desktop */}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm font-medium text-zinc-500">
                {user.displayName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <LoginDropdown />
          )}
        </div>
      </div>
    </header>
  );
};

// Sub-component for the Login Dropdown to keep code clean
const LoginDropdown = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="gap-2 hover:bg-transparent hover:text-cyan-600 active:text-cyan-600"
      >
        Login <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Manage Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/login">Login</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/login">Register</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/login/other">No Raven account?</Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Header;
