import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import JobEditor from '@/components/requisition/JobEditor';
import FloatingButton from '@/components/FloatingButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Pencil, 
  Trash2, 
  PlusCircle, 
  CheckCircle, 
  ClipboardList, 
  Search, 
  Loader2, 
  Building, 
  MapPin, 
  ShieldAlert,
  DollarSign, 
  CalendarIcon 
} from 'lucide-react'; 
import { toast } from 'sonner';

import { useUserRole } from '@/contexts/UserRoleContext';
import { getFirebaseAuth, getCurrentUserId, getAllJobsForRecruiter, deleteJob } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// For Date Formatting
import { format } from 'date-fns';

// Define Job interface (updated to include new fields)
interface Job {
  id: string;
  jobTitle: string;
  companyName?: string;
  location: string;
  department?: string;
  description: string;
  status: 'Draft' | 'Published';
  postedAt: string;
  recruiterId: string;
  salary?: string;
  skills?: string;
  deadline?: string;
}

const Requisitions = () => {
  const { userRole, isLoadingRole } = useUserRole();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Draft' | 'Published'>('All');
  const [refreshKey, setRefreshKey] = useState(0); // NEW: State to force Layout re-render


  const auth = getFirebaseAuth();
  const currentFirebaseUser = auth?.currentUser;
  const recruiterId = currentFirebaseUser ? getCurrentUserId(currentFirebaseUser) : '';

  const fetchJobs = async () => {
    if (!recruiterId || isLoadingRole) {
      return;
    }

    setLoadingJobs(true);
    try {
      const fetchedJobs = await getAllJobsForRecruiter(recruiterId);
      setJobs(fetchedJobs as Job[]);
    } catch (error) {
      console.error("Requisitions Page: Error fetching jobs:", error);
      toast.error("Failed to load your job requisitions.");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [recruiterId, isLoadingRole, refreshKey]);

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsEditorOpen(true);
  };

  const handleDeleteJob = async (jobId: string, jobStatus: 'Draft' | 'Published') => {
    if (!recruiterId) {
      toast.error("Authentication required to delete job.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this job requisition? This action cannot be undone.")) {
      try {
        await deleteJob(jobId, jobStatus, recruiterId);
        toast.success("Job deleted successfully!");
        setRefreshKey(prev => prev + 1); // Increment key to force refresh
      }
      catch (error: any) {
        console.error("Requisitions Page: Error deleting job:", error);
        toast.error(error.message || "Failed to delete job. Check console for details.");
      }
    }
  };

  const handleJobEditorClose = (jobSaved: boolean, newJobId?: string) => {
    setIsEditorOpen(false);
    setEditingJob(null); // Clear editing job state
    if (jobSaved) {
      setRefreshKey(prev => prev + 1); // Increment key to force refresh
    } else {
      toast.info("Job editing cancelled.");
    }
  };

  const handleCreateNewJob = () => {
    console.log("Requisitions: 'Post New Job' button clicked."); // NEW DEBUG LOG
    setEditingJob(null);
    setIsEditorOpen(true); // This should open the Dialog
    console.log("Requisitions: isEditorOpen set to true."); // NEW DEBUG LOG
  };

  // Filtered jobs based on search query and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoadingRole || loadingJobs) {
    return (
      <Layout key={refreshKey}> {/* Apply key to Layout */}
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-xl shadow-lg">
          <Loader2 className="h-16 w-16 text-gray-700 animate-spin" />
          <p className="text-xl text-gray-700 mt-4">Loading your job requisitions...</p>
        </div>
      </Layout>
    );
  }

  if (userRole !== 'recruiter' && userRole !== 'admin') {
    return (
      <Layout key={refreshKey}> {/* Apply key to Layout */}
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-red-50 rounded-xl shadow-lg border border-red-200 p-8">
          <ShieldAlert className="h-20 w-20 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-lg text-red-600 text-center">
            You do not have permission to view or manage job requisitions. This area is restricted to recruiters and administrators.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout key={refreshKey}> {/* Apply key to Layout */}
      <div className="mt-16 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Job Requisitions</h1>
          <p className="text-md text-gray-500">Manage your posted job openings and candidate pipeline.</p>
        </div>
        <Button onClick={handleCreateNewJob} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:scale-105">
          <PlusCircle size={20} className="mr-2" /> Post New Job
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-grow w-full sm:w-auto">
          <Input 
            type="text" 
            placeholder="Search by title, company, or location..." 
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Select 
          className="w-full sm:w-48 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Draft' | 'Published')}
        >
          <option value="All">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            <ClipboardList size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium">No requisitions found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters, or post a new job!</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <Card key={job.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center justify-between">
                  {job.jobTitle}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    job.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {job.status}
                  </span>
                </CardTitle>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Building size={14} className="text-gray-400" /> {job.companyName || 'N/A'}
                  <MapPin size={14} className="text-gray-400" /> {job.location}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 mb-3 line-clamp-3" dangerouslySetInnerHTML={{ __html: job.description }}></p>
                
                {/* Display Skills */}
                {job.skills && (
                  <div className="mb-2">
                    <Label className="text-xs font-semibold text-gray-600">Skills:</Label>
                    <p className="text-sm text-gray-700">{job.skills}</p>
                  </div>
                )}

                {/* Display Salary */}
                {job.salary && (
                  <div className="flex items-center text-md font-semibold text-green-700 mb-2">
                    <DollarSign className="mr-1" size={16} /> {job.salary}
                  </div>
                )}

                {/* Display Deadline */}
                {job.deadline && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <CalendarIcon className="mr-1" size={14} /> Apply by: {format(new Date(job.deadline), "PPP")}
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleEditJob(job)}>
                    <Pencil size={15} /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1" onClick={() => handleDeleteJob(job.id, job.status)}>
                    <Trash2 size={15} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[900px] p-6 max-h-full overflow-y-auto"> {/* Added max-h-full and overflow-y-auto */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingJob ? 'Edit Job Requisition' : 'Post New Job Requisition'}</DialogTitle>
            <DialogDescription className="text-md text-gray-600">
              {editingJob ? `Editing: ${editingJob.jobTitle}` : 'Fill in the details for your new job opening. AI can help you craft compelling descriptions!'}
            </DialogDescription>
          </DialogHeader>
          <JobEditor job={editingJob} onSave={handleJobEditorClose} onCancel={() => handleJobEditorClose(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Requisitions;
