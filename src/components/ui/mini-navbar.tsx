"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types for CMS navbar config
interface NavLink {
  id: string;
  label: string;
  url: string;
  isExternal?: boolean;
  isVisible?: boolean;
}

interface NavbarConfig {
  logoUrl: string;
  siteName: string;
  tagline: string;
  navLinks: NavLink[];
  ctaText: string;
  ctaUrl: string;
  ctaVisible: boolean;
}

// Default values (fallback)
const DEFAULT_NAVBAR: NavbarConfig = {
  logoUrl: '',
  siteName: 'AskJai',
  tagline: 'AI Prompt Generator',
  navLinks: [
    { id: '1', label: 'Features', url: '#features', isVisible: true },
    { id: '2', label: 'Pricing', url: '#pricing', isVisible: true },
    { id: '3', label: 'Templates', url: '/templates', isVisible: true },
    { id: '4', label: 'Blogs', url: '/blogs', isVisible: true },
    { id: '5', label: 'About', url: '/about', isVisible: true },
    { id: '6', label: 'Contact', url: '/contact', isVisible: true },
  ],
  ctaText: 'Dashboard',
  ctaUrl: '/dashboard',
  ctaVisible: true,
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const AnimatedNavLink = ({ to, children, onClick }: NavLinkProps) => {
  const defaultTextColor = 'text-muted-foreground';
  const hoverTextColor = 'text-foreground';
  const textSizeClass = 'text-sm';
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (to.startsWith('#')) {
      e.preventDefault();
      const hash = to;
      // If on landing page, just scroll
      if (location.pathname === '/') {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to landing page with hash
        navigate('/' + hash);
      }
    }
    onClick?.();
  };

  if (to.startsWith('#')) {
    return (
      <a 
        href={to} 
        onClick={handleClick}
        className={`group relative inline-block overflow-hidden ${textSizeClass}`}
        style={{ height: '1.25rem' }}
      >
        <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
          <span className={`${defaultTextColor} leading-5`}>{children}</span>
          <span className={`${hoverTextColor} leading-5`}>{children}</span>
        </div>
      </a>
    );
  }

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`group relative inline-block overflow-hidden ${textSizeClass}`}
      style={{ height: '1.25rem' }}
    >
      <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className={`${defaultTextColor} leading-5`}>{children}</span>
        <span className={`${hoverTextColor} leading-5`}>{children}</span>
      </div>
    </Link>
  );
};

export function MiniNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const [navConfig, setNavConfig] = useState<NavbarConfig>(DEFAULT_NAVBAR);
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch navbar config from CMS
  useEffect(() => {
    const fetchNavbar = async () => {
      const { data, error } = await supabase
        .from('cms_config')
        .select('data')
        .eq('section', 'navbar')
        .maybeSingle();

      if (!error && data?.data) {
        const config = { ...DEFAULT_NAVBAR, ...data.data };
        setNavConfig(config);
        // Update browser tab title
        if (config.siteName) {
          document.title = config.tagline 
            ? `${config.siteName} — ${config.tagline}`
            : config.siteName;
        }
      }
    };
    fetchNavbar();
  }, []);

  // Check if we're on a dashboard/app page (logged in user pages)
  const isDashboardPage = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/generate') ||
                          location.pathname.startsWith('/generative-ai') ||
                          location.pathname.startsWith('/templates') ||
                          location.pathname.startsWith('/template/') ||
                          location.pathname.startsWith('/history') ||
                          location.pathname.startsWith('/settings') ||
                          location.pathname.startsWith('/profile') ||
                          location.pathname.startsWith('/analytics') ||
                          location.pathname.startsWith('/upgrade');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <Link to="/" className="flex items-center gap-2">
      {navConfig.logoUrl ? (
        <img src={navConfig.logoUrl} alt={navConfig.siteName} className="h-7 w-7" />
      ) : (
        <img src="/askjai-logo.png" alt="AskJai" className="h-7 w-7" />
      )}
      <span className="font-display text-sm font-bold text-white hidden sm:block">{navConfig.siteName}</span>
    </Link>
  );

  // Use CMS nav links for landing, filter visible ones
  const landingNavLinks = navConfig.navLinks
    .filter(link => link.isVisible !== false)
    .map(link => ({ label: link.label, to: link.url }));

  const dashboardNavLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Generate', to: '/generate' },
    { label: 'Templates', to: '/templates' },
    { label: 'History', to: '/history' },
    { label: 'Blogs', to: '/blogs' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const navLinksData = isDashboardPage ? dashboardNavLinks : landingNavLinks;

  const loginButtonElement = (
    <button 
      onClick={() => navigate('/auth')}
      className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-muted-foreground rounded-full hover:border-border hover:text-foreground transition-colors duration-200 w-full sm:w-auto"
    >
      Log In
    </button>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
       <div className="absolute inset-0 -m-2 rounded-full
                     hidden sm:block
                     bg-primary
                     opacity-40 filter blur-lg pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"></div>
       <button 
         onClick={() => navigate('/auth?mode=signup')}
         className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200 w-full sm:w-auto"
       >
         Sign Up
       </button>
    </div>
  );

  const dashboardButtonElement = navConfig.ctaVisible ? (
    <Link 
      to={navConfig.ctaUrl}
      className="relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-primary to-purple-400 rounded-full hover:from-primary/90 hover:to-purple-500 transition-all duration-200 w-full sm:w-auto text-center"
    >
      {navConfig.ctaText}
    </Link>
  ) : null;

  // Render right side content based on page type
  const renderRightContent = () => {
    if (isDashboardPage && user) {
      // ProfileDropdown is rendered separately at top-right
      return null;
    }
    if (user) {
      return dashboardButtonElement;
    }
    return (
      <>
        {loginButtonElement}
        {signupButtonElement}
      </>
    );
  };

  // Render mobile menu right content
  const renderMobileRightContent = () => {
    if (isDashboardPage && user) {
      // ProfileDropdown is rendered separately at top-right
      return null;
    }
    if (user) {
      return dashboardButtonElement;
    }
    return (
      <>
        {loginButtonElement}
        {signupButtonElement}
      </>
    );
  };

  return (
    <>
      {/* Fixed Profile Dropdown at top-right for dashboard pages */}
      {isDashboardPage && user && (
        <div className="fixed top-6 right-6 z-50">
          <ProfileDropdown compact />
        </div>
      )}

      <header className={`fixed top-6 z-50
                       flex flex-col items-center
                       pl-4 pr-4 sm:pl-6 sm:pr-6 py-3 backdrop-blur-md
                       ${headerShapeClass}
                       border border-[#333] bg-[#1f1f1f99]
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-0 ease-in-out
                       ${isDashboardPage ? 'left-[calc(50%+35px)] -translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}>

      <div className="flex items-center justify-between w-full gap-x-4 sm:gap-x-8">
        <div className="flex items-center">
           {logoElement}
        </div>

        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.to} to={link.to}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        {(!isDashboardPage || !user) && (
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {renderRightContent()}
          </div>
        )}

        <button 
          className="sm:hidden flex items-center justify-center w-8 h-8 text-muted-foreground focus:outline-none" 
          onClick={toggleMenu} 
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            link.to.startsWith('#') ? (
              <a 
                key={link.to} 
                href={link.to} 
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector(link.to);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsOpen(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>
        {(!isDashboardPage || !user) && (
          <div className="flex flex-col items-center space-y-4 mt-4 w-full">
            {renderMobileRightContent()}
          </div>
        )}
      </div>
    </header>
    </>
  );
}
