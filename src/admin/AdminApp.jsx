import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';

/**
 * Root layout for admin portal
 * Contains sidebar, topbar, and renders nested routes via Outlet
 */
export default function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef(null);
  const scrollPositions = useRef({});
  const location = useLocation();

  // Save scroll position before route change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (mainRef.current) {
        scrollPositions.current[location.pathname] = mainRef.current.scrollTop;
      }
    };

    return () => {
      // Save current scroll position when unmounting
      if (mainRef.current) {
        scrollPositions.current[location.pathname] = mainRef.current.scrollTop;
      }
    };
  }, [location.pathname]);

  // Restore scroll position after route change
  useEffect(() => {
    const savedPosition = scrollPositions.current[location.pathname];
    if (mainRef.current && savedPosition !== undefined) {
      mainRef.current.scrollTop = savedPosition;
    }
  }, [location.pathname]);

  // Memoized close handler to prevent unnecessary re-renders
  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  return (
    <div className="admin-scope min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
      />
      
      {/* Main content */}
      <div className="lg:ml-64 h-screen flex flex-col">
        {/* Topbar */}
        <AdminTopbar onMenuClick={handleMenuClick} />
        
        {/* Page content - scrollable */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
