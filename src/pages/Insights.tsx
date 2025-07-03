
import React from 'react';
import Layout from '@/components/layout/Layout';
import MarketHeatmap from '@/components/insights/MarketHeatmap';
import CareerPathway from '@/components/insights/CareerPathway';
import FloatingButton from '@/components/FloatingButton';

const Insights = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Talent Market Insights</h1>
        <p className="text-sm text-gray-500">Labor market trends, supply-demand analysis, and career pathways</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <MarketHeatmap />
        </div>
        <div>
          <CareerPathway />
        </div>
      </div>

      <FloatingButton />
    </Layout>
  );
};

export default Insights;
