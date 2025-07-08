// src/pages/NewJobPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout'; // Relative path
import JobEditor from '../components/requisition/JobEditor'; // Relative path
import { toast } from 'sonner';

const NewJobPage = () => {
  const navigate = useNavigate();

  const handleSave = (jobSaved: boolean, newJobId?: string) => {
    if (jobSaved) {
      toast.success("Job saved successfully!");
      navigate('/requisitions'); // Navigate back to requisitions list
    } else {
      toast.info("Job creation cancelled or failed.");
      navigate('/requisitions'); // Navigate back even if cancelled
    }
  };

  const handleCancel = () => {
    toast.info("Job creation cancelled.");
    navigate('/requisitions'); // Navigate back to requisitions list
  };

  return (
    <Layout>
      <div className="mt-16 mb-6"> {/* Added margin top to push content below Topbar */}
        {/* JobEditor is rendered here with no initial job, indicating a new job */}
        <JobEditor job={null} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default NewJobPage;
