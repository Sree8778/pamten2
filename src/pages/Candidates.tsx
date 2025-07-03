
import React from 'react';
import Layout from '@/components/layout/Layout';
import ProfileHeader from '@/components/candidate/ProfileHeader';
import ResumeView from '@/components/candidate/ResumeView';
import BackgroundCheck from '@/components/candidate/BackgroundCheck';
import FloatingButton from '@/components/FloatingButton';

const Candidates = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidate Profile</h1>
        <p className="text-sm text-gray-500">View and manage candidate information</p>
      </div>
      
      <ProfileHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResumeView />
        </div>
        <div>
          <BackgroundCheck />
        </div>
      </div>

      <FloatingButton />
    </Layout>
  );
};

export default Candidates;
