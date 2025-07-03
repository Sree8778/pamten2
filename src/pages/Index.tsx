// src/pages/Index.tsx
import React from 'react';
import { useUserRole } from '@/contexts/UserRoleContext'; // Import useUserRole
import CandidateDashboard from './CandidateDashboard'; // Import CandidateDashboard
import RecruiterDashboard from './RecruiterDashboard'; // Import RecruiterDashboard
import Layout from '@/components/layout/Layout'; // Import Layout for loading state

const Index = () => {
  const { userRole, isLoadingRole } = useUserRole();

  if (isLoadingRole) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full min-h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="ml-4 text-gray-700 mt-4">Loading user dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Debugging log to see the resolved role from the context
  console.log("Index Page (DEBUG): userRole from context:", userRole);

  // CRUCIAL FIX: Ensure correct conditional rendering based on userRole
  if (userRole === 'recruiter' || userRole === 'admin') { // Check for recruiter or admin role
    console.log("Index Page (DEBUG): Rendering RecruiterDashboard for role:", userRole);
    return <RecruiterDashboard />;
  } else if (userRole === 'candidate') { // Check for candidate role
    console.log("Index Page (DEBUG): Rendering CandidateDashboard for role:", userRole);
    return <CandidateDashboard />;
  } else {
    // Fallback or error state if role is unknown or null after loading
    console.log("Index Page (DEBUG): Rendering Fallback Dashboard for role:", userRole);
    return (
      <Layout>
        <div className="flex justify-center items-center h-full min-h-[500px]">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Access Denied or Unknown Role</h2>
            <p className="text-gray-600 mb-4">
              Your role ({userRole === null ? 'N/A' : userRole}) does not have access to this dashboard.
            </p>
            <p className="text-gray-500 text-sm">Please contact support if you believe this is an error.</p>
          </div>
        </div>
      </Layout>
    );
  }
};

export default Index;
