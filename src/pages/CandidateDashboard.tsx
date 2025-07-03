// src/pages/CandidateDashboard.tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import KpiTile from '@/components/dashboard/KpiTile';
import JobInsights from '@/components/dashboard/JobInsights';
import FloatingButton from '@/components/FloatingButton';
import { File, DollarSign, TrendingUp } from 'lucide-react'; // Example icons

const CandidateDashboard = () => {
  return (
    <Layout>
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, Candidate! 🚀
          </h1>
          <p className="text-xl opacity-90">
            Your personalized career intelligence platform powered by AI
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live market data</span>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>AI insights active</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Profile optimized</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiTile 
          title="🎯 Perfect Job Matches" 
          value="47" 
          subtitle="New matches this week"
          icon={<File size={16} className="text-blue-500" />}
        />
        <KpiTile 
          title="💰 Your Market Value" 
          value="$89K" 
          subtitle="15% above average"
          icon={<DollarSign size={16} className="text-green-500" />}
        />
        <KpiTile 
          title="📈 Career Growth Score" 
          value="85%" 
          subtitle="Top 10% in your field"
          icon={<TrendingUp size={16} className="text-purple-500" />}
        />
      </div>

      <JobInsights />
      
      {/* You can add more candidate-specific widgets here */}

      <FloatingButton />
    </Layout>
  );
};

export default CandidateDashboard;
