// src/pages/RecruiterDashboard.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import KpiTile from '@/components/dashboard/KpiTile';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import HeatmapPlaceholder from '@/components/dashboard/HeatmapPlaceholder';
import FloatingButton from '@/components/FloatingButton';
import { Users, ClipboardList, TrendingUp } from 'lucide-react'; // Example icons

const RecruiterDashboard = () => {
  return (
    <Layout>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-teal-500 rounded-2xl p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, Recruiter! 💼
          </h1>
          <p className="text-xl opacity-90">
            Manage your hiring pipeline and talent acquisition
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>New Candidate Alerts</span>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span>Urgent Requisitions</span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Hiring Trends Live</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiTile 
          title="Candidates in Pipeline" 
          value="128" 
          subtitle="Active candidates this week"
          icon={<Users size={16} className="text-teal-500" />}
        />
        <KpiTile 
          title="Open Requisitions" 
          value="12" 
          subtitle="New reqs this month"
          icon={<ClipboardList size={16} className="text-orange-500" />}
        />
        <KpiTile 
          title="Hiring Velocity" 
          value="+8%" 
          subtitle="Month over Month"
          icon={<TrendingUp size={16} className="text-lime-500" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <HeatmapPlaceholder /> {/* Re-using for recruiter view */}
        </div>
        <div>
          <ActivityFeed /> {/* Re-using for recruiter view */}
        </div>
      </div>
      
      {/* You can add more recruiter-specific widgets here */}

      <FloatingButton />
    </Layout>
  );
};

export default RecruiterDashboard;
