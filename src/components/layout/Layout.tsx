import React from 'react';
import { useUserRole } from '@/contexts/UserRoleContext'; // Keep useUserRole if Topbar or children use it
import Sidebar from './Sidebar'; // NEW: Import the universal Sidebar
// Removed: import CandidateSidebar from './CandidateSidebar';
// Removed: import RecruiterSidebar from './RecruiterSidebar';
// Removed: import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar'; // Assuming Topbar exists

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // We still need userRole and isLoadingRole if Topbar or children components depend on it.
  // If only Sidebar uses it, you could potentially remove it from Layout, but it's safer to keep for now.
  const { userRole, isLoadingRole } = useUserRole(); 

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Render the universal Sidebar */}
      <Sidebar /> 
      <div className="flex-1 flex flex-col ml-60"> {/* Adjust ml-60 to match sidebar width */}
        <Topbar /> {/* Your existing Topbar component */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
