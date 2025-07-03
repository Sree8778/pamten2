
import React from 'react';
import Layout from '@/components/layout/Layout';
import BackgroundTable from '@/components/screening/BackgroundTable';
import FloatingButton from '@/components/FloatingButton';

const Screening = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Background Check Dashboard</h1>
        <p className="text-sm text-gray-500">Monitor and manage candidate verification processes</p>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded p-4 bg-white flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">18</div>
            <div className="text-xs text-gray-500">Total Active Checks</div>
          </div>
          <div className="border rounded p-4 bg-white flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">7</div>
            <div className="text-xs text-gray-500">Completed This Week</div>
          </div>
          <div className="border rounded p-4 bg-white flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">4.2</div>
            <div className="text-xs text-gray-500">Avg. Days to Complete</div>
          </div>
        </div>
        
        <BackgroundTable />
      </div>

      <FloatingButton />
    </Layout>
  );
};

export default Screening;
