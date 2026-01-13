import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const Header = ({ brandText, committee, routes, user }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper for NavLink styles
  const navLinkClass = ({ isActive }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-primary',
      isActive ? 'text-black dark:text-white' : 'text-muted-foreground'
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            {brandText}
          </Link>

          {/* Desktop Navigation (Left Side) */}
          <nav className="hidden lg:flex items-center gap-6">
            {committee && (
              <NavLink to={committee.link} className={navLinkClass}>
                {committee.text}
              </NavLink>
            )}
            {/* Filter and map routes if needed on desktop */}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Desktop User Menu / Login */}
          <nav className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Signed in as:{' '}
                  <Link
                    to="/register"
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {user.displayName}
                  </Link>
                </span>
                <Button variant="ghost" asChild size="sm">
                  <NavLink to="/logout">Logout</NavLink>
                </Button>
              </div>
            ) : (
              <LoginDropdown />
            )}
          </nav>

          {/* Mobile Menu (Sheet) */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {committee && (
                    <NavLink
                      to={committee.link}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-semibold"
                    >
                      {committee.text}
                    </NavLink>
                  )}
                  <div className="h-px bg-border my-2" />
                  {routes.map((prop, index) => {
                    if (prop.category)
                      return (
                        <span
                          key={index}
                          className="text-xs uppercase text-muted-foreground mt-2"
                        >
                          {prop.name}
                        </span>
                      );
                    if (prop.hide) return null;
                    return (
                      <NavLink
                        key={prop.path || index}
                        to={prop.layout + prop.path}
                        onClick={() => setIsOpen(false)}
                        className="text-lg"
                      >
                        {prop.name}
                      </NavLink>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
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

      {/* Dev Login Section */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="text-yellow-600 focus:text-yellow-600"
          >
            <Link to="/login/dev">🔓 Dev Login</Link>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default Header;
