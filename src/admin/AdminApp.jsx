import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';

/**
 * Root layout for admin portal
 * Contains sidebar, topbar, and renders nested routes via Outlet
 */
export default function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main content */}
      <div className="lg:ml-64">
        {/* Topbar */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
