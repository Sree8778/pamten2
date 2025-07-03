// src/pages/Applications.tsx
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  ListFilter,
  Search,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mic,
  FileText,
  Loader2,
  ShieldAlert,
  Mail, 
  MapPin,
  Phone // Imported Phone icon
} from 'lucide-react'; 
import { toast } from 'sonner';
import { useUserRole } from '@/contexts/UserRoleContext';
import { getFirebaseAuth, getCurrentUserId, getAllApplicationsForRecruiter, getUserProfile, updateApplicationStatus } from '@/lib/firebase'; // Import updateApplicationStatus
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

// Define Application interface (should match Firestore data)
interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetter?: string;
  elevatorPitchText?: string;
  elevatorPitchVideoUrl?: string;
  elevatorPitchVideoFileName?: string;
  status: 'Started Application' | 'Applied' | 'Under Review' | 'Interviewing' | 'Rejected' | 'Hired';
  appliedAt?: string;
  draftedAt?: string;
  submittedAt?: string;
}

// Define CandidateProfile interface (matching userProfile structure)
interface CandidateProfile {
  name?: string;
  email?: string;
  phone?: string; // Ensure phone is here if you fetch it
  location?: string;
  skills?: string;
  // Add any other relevant fields from your userProfile document
}

// Combined Application and CandidateProfile for display
interface ApplicationWithCandidate extends Application {
  candidateProfile?: CandidateProfile;
}

const Applications = () => {
  const { userRole, isLoadingRole } = useUserRole();
  const [applications, setApplications] = useState<ApplicationWithCandidate[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Application['status']>('All');

  const auth = getFirebaseAuth();
  const currentFirebaseUser = auth?.currentUser;
  const recruiterId = currentFirebaseUser ? getCurrentUserId(currentFirebaseUser) : '';

  const fetchApplications = async () => {
    if (!recruiterId || isLoadingRole) {
      console.log("Applications: Skipping fetch applications, recruiterId or role not ready.");
      return;
    }

    setLoadingApplications(true);
    console.log("Applications: Fetching applications for recruiter:", recruiterId);
    try {
      const fetchedApps = await getAllApplicationsForRecruiter(recruiterId);
      
      // Fetch candidate profiles for each application
      const applicationsWithCandidates: ApplicationWithCandidate[] = await Promise.all(
        fetchedApps.map(async (app: Application) => {
          const candidateProfile = await getUserProfile(app.applicantId) as CandidateProfile;
          return { ...app, candidateProfile };
        })
      );

      setApplications(applicationsWithCandidates);
      toast.success(`Loaded ${applicationsWithCandidates.length} applications.`);
      console.log("Applications: Successfully fetched applications. Data:", applicationsWithCandidates);
    } catch (error) {
      console.error("Applications Page: Error fetching applications:", error);
      toast.error("Failed to load applications.");
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [recruiterId, isLoadingRole]);

  const handleStatusChange = async (appId: string, newStatus: Application['status'], applicantId: string) => {
    if (!recruiterId) {
      toast.error("Authentication required to update status.");
      return;
    }
    try {
      await updateApplicationStatus(applicantId, appId, newStatus); // Call the new function
      toast.success(`Application status updated to ${newStatus}.`);
      fetchApplications(); // Re-fetch applications to update the list
    } catch (error: any) {
      console.error("Error updating application status:", error);
      toast.error(error.message || "Failed to update application status.");
    }
  };

  // Filtered applications based on search query and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (app.applicantEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (app.candidateProfile?.skills || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (app.candidateProfile?.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoadingRole || loadingApplications) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-xl shadow-lg">
          <Loader2 className="h-16 w-16 text-gray-700 animate-spin" />
          <p className="text-xl text-gray-700 mt-4">Loading applications...</p>
        </div>
      </Layout>
    );
  }

  // Access control for this page (only recruiters/admins)
  if (userRole !== 'recruiter' && userRole !== 'admin') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-red-50 rounded-xl shadow-lg border border-red-200 p-8">
          <ShieldAlert className="h-20 w-20 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-lg text-red-600 text-center">
            You do not have permission to view this page. This area is restricted to recruiters and administrators.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Job Applications</h1>
          <p className="text-md text-gray-500">Review and manage candidate applications for your job postings.</p>
        </div>
        {/* Potentially add actions like "Export Applications" here */}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-grow w-full sm:w-auto">
          <Input 
            type="text" 
            placeholder="Search by applicant name, job title, or company..." 
            className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Select 
          className="w-full sm:w-48 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'All' | Application['status'])}
        >
          <option value="All">All Statuses</option>
          <option value="Started Application">Started Application</option>
          <option value="Applied">Applied</option>
          <option value="Under Review">Under Review</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Rejected">Rejected</option>
          <option value="Hired">Hired</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            <ListFilter size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium">No applications found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredApplications.map(app => (
            <Card key={app.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center justify-between">
                  {app.applicantName}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    app.status === 'Hired' ? 'bg-green-100 text-green-700' :
                    app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' : // Added status color
                    app.status === 'Interviewing' ? 'bg-purple-100 text-purple-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {app.status}
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" /> {app.jobTitle} at {app.companyName}
                </p>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {app.applicantEmail && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" /> {app.applicantEmail}
                    </p>
                )}
                {app.candidateProfile?.phone && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" /> {app.candidateProfile.phone}
                    </p>
                )}
                {app.candidateProfile?.location && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" /> {app.candidateProfile.location}
                    </p>
                )}
                {app.candidateProfile?.skills && (
                    <div className="text-sm text-gray-700">
                        <Label className="text-xs font-semibold text-gray-600">Skills:</Label>
                        <p>{app.candidateProfile.skills}</p>
                    </div>
                )}

                <div className="flex justify-between items-center space-x-2 mt-4"> {/* Adjusted for better button alignment */}
                  <div className="flex space-x-2"> {/* Group buttons */}
                    {app.resumeUrl && (
                      <Button variant="outline" size="sm" onClick={() => window.open(app.resumeUrl, '_blank')} className="flex items-center gap-1">
                        <Eye size={15} className="mr-1" /> Resume
                      </Button>
                    )}
                    {app.elevatorPitchVideoUrl && (
                      <Button variant="outline" size="sm" onClick={() => window.open(app.elevatorPitchVideoUrl, '_blank')} className="flex items-center gap-1">
                        <Mic size={15} className="mr-1" /> Video Pitch
                      </Button>
                    )}
                  </div>
                  {/* Status Update Dropdown */}
                  <Select 
                    value={app.status}
                    onValueChange={(newStatus: Application['status']) => handleStatusChange(app.id, newStatus, app.applicantId)}
                    className="w-auto text-sm min-w-[120px]" // Added min-width
                  >
                    <option value="Started Application">Started Application</option>
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hired">Hired</option>
                  </Select>
                </div>
                {/* Review App button moved outside the flex for status dropdown */}
                <div className="flex justify-end mt-2">
                    <Button size="sm" variant="secondary">
                        Review App
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Applications;
