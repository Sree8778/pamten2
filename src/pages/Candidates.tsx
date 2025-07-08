// src/pages/Candidates.tsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ProfileHeader from '../components/candidate/ProfileHeader';
import ResumeView from '../components/candidate/ResumeView';
import BackgroundCheck from '../components/candidate/BackgroundCheck';
import FloatingButton from '../components/FloatingButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'; // Added SelectContent, SelectItem, SelectTrigger, SelectValue
import { Search, Loader2, Users, BriefcaseBusiness, MailOpen, Eye, ShieldAlert } from 'lucide-react';
import { useUserRole } from '../contexts/UserRoleContext';
import { getFirebaseAuth, getCurrentUserId, getAllJobsForRecruiter, getUserProfile, getFirebaseDb } from '../lib/firebase'; // Removed getAllApplicationsForRecruiter from here
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // FIXED: Corrected import syntax for toast
import { format } from 'date-fns';
import { collection, query, where, getDocs, doc, getDoc, collectionGroup } from 'firebase/firestore'; // Import getDoc and collectionGroup


// Define Job interface (must match your Firestore structure)
interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  department: string;
  description: string;
  status: 'Draft' | 'Published';
  postedAt: string;
  recruiterId: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  deadline?: string;
  relocationAssistance?: boolean;
  workArrangement?: 'On-site' | 'Hybrid' | 'Remote (Country)' | 'Remote (Global)' | '';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | '';
  experienceLevel?: 'Entry-Level' | 'Associate' | 'Mid-Level' | 'Senior' | 'Lead' | 'Manager' | 'Executive' | '';
  industry?: string;
  companyLogoUrl?: string;
  aboutCompany?: string;
  companyWebsiteUrl?: string;
}

// Define ParsedResumeData interface
interface ParsedResumeData {
  personal: { name?: string; email?: string; phone?: string; location?: string; legalStatus?: string; };
  summary?: string;
  experience?: Array<{ jobTitle?: string; company?: string; dates?: string; description?: string; }>;
  education?: Array<{ degree?: string; institution?: string; graduationYear?: string; gpa?: string; achievements?: string; }>;
  skills?: Array<{ category?: string; skills_list?: string; }>;
  projects?: Array<{ title?: string; date?: string; description?: string; }>;
  publications?: Array<{ title?: string; authors?: string; journal?: string; date?: string; link?: string; }>;
  certifications?: Array<{ name?: string; issuer?: string; date?: string; }>;
}

// Define Application interface (UPDATED with parsed content fields)
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
  parsedResumeContent?: ParsedResumeData;
  parsedExperience?: Array<any>;
  parsedProjects?: Array<any>;
  parsedSkills?: Array<any>;
  parsedEducation?: Array<any>;
  parsedCertifications?: Array<any>;
  parsedPublications?: Array<any>;
}

// Define CandidateProfile interface (now includes parsed resume content directly)
interface CandidateProfile {
  id: string; // User ID
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  currentRole?: string;
  // Directly include parsed resume content for display
  parsedResumeContent?: ParsedResumeData;
  // Also include direct parsed fields for convenience if needed, though parsedResumeContent is primary
  parsedExperience?: Array<any>;
  parsedProjects?: Array<any>;
  parsedSkills?: Array<any>;
  parsedEducation?: Array<any>;
  parsedCertifications?: Array<any>;
  parsedPublications?: Array<any>;
}

const Candidates = () => {
  const { userRole, isLoadingRole } = useUserRole();
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const currentFirebaseUser = auth?.currentUser;
  const recruiterId = currentFirebaseUser ? getCurrentUserId(currentFirebaseUser) : '';
  const db = getFirebaseDb(); // Get db instance

  const [loadingContent, setLoadingContent] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState<CandidateProfile | null>(null);
  const [viewMode, setViewMode] = useState<'jobs' | 'applicants' | 'candidate-detail'>('jobs');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Application['status']>('All');
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingContent(true);
      if (isLoadingRole || !recruiterId || !db) { // Ensure db is available
        setLoadingContent(false);
        return;
      }

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      if (applicantId) {
        setViewMode('candidate-detail');
        try {
          const userProfile = await getUserProfile(applicantId) as CandidateProfile;

          // NEW: Fetch the specific application that led to this candidate view
          // This assumes we might pass jobId via state or find the most recent application
          // For simplicity, let's try to find *any* application for this applicant to get parsed data
          const applicationsForApplicantQuery = query(
            collection(db, `artifacts/${appId}/users/${applicantId}/applications`),
            // You might want to order by submittedAt and limit(1) if there are multiple applications
            // For now, just getting all and taking the first one that has parsed data
          );
          const appSnap = await getDocs(applicationsForApplicantQuery);
          let parsedContent: ParsedResumeData | undefined;
          let parsedExperience: any[] | undefined;
          let parsedProjects: any[] | undefined;
          let parsedSkills: any[] | undefined;
          let parsedEducation: any[] | undefined;
          let parsedCertifications: any[] | undefined;
          let parsedPublications: any[] | undefined;


          if (!appSnap.empty) {
            // Find the first application that has parsedResumeContent
            const appWithParsedContent = appSnap.docs.find(doc => (doc.data() as Application).parsedResumeContent);
            if (appWithParsedContent) {
              const latestApp = appWithParsedContent.data() as Application;
              parsedContent = latestApp.parsedResumeContent;
              parsedExperience = latestApp.parsedExperience;
              parsedProjects = latestApp.parsedProjects;
              parsedSkills = latestApp.parsedSkills;
              parsedEducation = latestApp.parsedEducation;
              parsedCertifications = latestApp.parsedCertifications;
              parsedPublications = latestApp.parsedPublications;
            }
          }

          if (userProfile) {
            setSelectedCandidateProfile({
              ...userProfile,
              id: applicantId,
              parsedResumeContent: parsedContent,
              parsedExperience: parsedExperience,
              parsedProjects: parsedProjects,
              parsedSkills: parsedSkills,
              parsedEducation: parsedEducation,
              parsedCertifications: parsedCertifications,
              parsedPublications: parsedPublications,
            });
          } else {
            toast.error("Candidate profile not found.");
            navigate('/candidates');
          }
        } catch (error) {
          console.error("Error fetching candidate profile:", error);
          toast.error("Failed to load candidate profile.");
          navigate('/candidates');
        }
      } else {
        setViewMode('jobs');
        try {
          const fetchedJobs = await getAllJobsForRecruiter(recruiterId);
          setJobs(fetchedJobs as Job[]);
        } catch (error) {
          console.error("Error fetching recruiter jobs:", error);
          toast.error("Failed to load your job requisitions.");
        }
      }
      setLoadingContent(false);
    };

    fetchData();
  }, [applicantId, recruiterId, isLoadingRole, navigate, db]); // Added db to dependencies

  // Helper to get app ID from firebase config (copied from ApplyJob.tsx for consistency)
  const getAppId = () => {
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    return firebaseConfig.projectId || 'default-app-id';
  };

  const fetchApplicationsForJob = async (jobId: string) => {
    setLoadingContent(true);
    try {
      // Fetch all applications for the recruiter, then filter by jobId
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      // To get applications for a specific job, we need to query the collectionGroup 'applications'
      // and filter by jobId. This requires a composite index in Firestore.
      // For simplicity, let's assume getAllApplicationsForRecruiter fetches all relevant apps
      // and we filter them here. If performance is an issue, a collectionGroup query is better.
      // Note: getAllApplicationsForRecruiter already uses collectionGroup and filters by recruiter's jobs.
      // const applicationsCollectionGroupRef = collection(db, `artifacts/${appId}/users`); // Start from users collection
      const allUserApplicationsQuery = query(collectionGroup(db, 'applications'), where("jobId", "==", jobId));
      const querySnapshot = await getDocs(allUserApplicationsQuery);

      const filteredApps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Application[];

      // Further filter by recruiter's jobs if getAllApplicationsForRecruiter is not used directly
      const recruiterJobs = await getAllJobsForRecruiter(recruiterId);
      const recruiterJobIds = new Set(recruiterJobs.map(job => job.id));
      const finalFilteredApps = filteredApps.filter(app => recruiterJobIds.has(app.jobId));


      setApplications(finalFilteredApps);
      setSelectedJobForApplicants(jobId);
      setViewMode('applicants');
      toast.success(`Loaded ${finalFilteredApps.length} applications for selected job.`);
    } catch (error) {
      console.error("Error fetching applications for job:", error);
      toast.error("Failed to load applications for this job.");
    } finally {
      setLoadingContent(false);
    }
  };

  const handleViewCandidateDetail = (candidateId: string) => {
    navigate(`/candidates/${candidateId}`);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoadingRole || loadingContent) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-xl shadow-lg">
          <Loader2 className="h-16 w-16 text-gray-700 animate-spin" />
          <p className="text-xl text-gray-700 mt-4">Loading content...</p>
        </div>
      </Layout>
    );
  }

  if (userRole !== 'recruiter' && userRole !== 'admin') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-red-50 rounded-xl shadow-lg border border-red-200 p-8">
          <ShieldAlert className="h-20 w-20 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-lg text-red-600 text-center">
            You do not have permission to view or manage candidates. This area is restricted to recruiters and administrators.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {viewMode === 'candidate-detail' && selectedCandidateProfile ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Candidate Profile</h1>
              <p className="text-sm text-gray-500">Viewing details for {selectedCandidateProfile.name || selectedCandidateProfile.email}</p>
            </div>
            <Button onClick={() => navigate('/candidates')} variant="outline">
              Back to Job Openings
            </Button>
          </div>

          <ProfileHeader candidate={selectedCandidateProfile} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResumeView candidate={selectedCandidateProfile} />
            </div>
            <div>
              <BackgroundCheck candidate={selectedCandidateProfile} />
            </div>
          </div>
        </>
      ) : viewMode === 'applicants' ? (
        // View for applicants of a specific job
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Applicants for Job: {jobs.find(j => j.id === selectedJobForApplicants)?.jobTitle || 'N/A'}</h1>
                    <p className="text-sm text-gray-500">Review candidates who applied to this position</p>
                </div>
                <Button onClick={() => setViewMode('jobs')} variant="outline">
                    Back to Job Openings
                </Button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search applicants by name or status..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <Select
                    className="w-48"
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as 'All' | Application['status'])} // Use onValueChange for shadcn Select
                >
                    <SelectTrigger> {/* Added SelectTrigger */}
                        <SelectValue placeholder="All Statuses" /> {/* Added SelectValue for placeholder */}
                    </SelectTrigger>
                    <SelectContent> {/* Added SelectContent */}
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Interviewing">Interviewing</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Hired">Hired</SelectItem>
                    </SelectContent>
                </Select>
                <Button>Filter</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplications.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                        <Users size={40} className="mx-auto mb-4" />
                        <p className="text-lg font-medium">No applicants found for this job.</p>
                        <p className="text-sm mt-2">Share the job posting to attract more candidates!</p>
                    </div>
                ) : (
                    filteredApplications.map(app => (
                        <Card key={app.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-gray-800">{app.applicantName}</CardTitle>
                                <CardDescription className="text-sm text-gray-600 flex items-center gap-2">
                                    <MailOpen size={14} className="text-gray-400" /> {app.applicantEmail}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 mb-2">Applied for: {app.jobTitle}</p>
                                <p className="text-xs text-gray-500">Status: {app.status}</p>
                                {app.appliedAt && <p className="text-xs text-gray-500">Applied: {format(new Date(app.appliedAt), "PPP")}</p>}
                                <div className="flex justify-end mt-4">
                                    <Button size="sm" onClick={() => handleViewCandidateDetail(app.applicantId)}>
                                        <Eye size={16} className="mr-1" /> View Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
      ) : (
        // Default view: list of recruiter's job openings
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Your Job Openings</h1>
            <p className="text-sm text-gray-500">Select a job to view its applicants</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                <BriefcaseBusiness size={40} className="mx-auto mb-4" />
                <p className="text-lg font-medium">No job openings posted yet.</p>
                <p className="text-sm mt-2">Go to "Requisitions" to post your first job!</p>
              </div>
            ) : (
              jobs.map(job => (
                <Card key={job.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-800">{job.jobTitle}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">{job.companyName} • {job.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3" dangerouslySetInnerHTML={{ __html: job.description }}></p>
                    <div className="flex justify-end mt-4">
                      <Button size="sm" onClick={() => fetchApplicationsForJob(job.id)}>
                        <Users size={16} className="mr-1" /> View Applicants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Floating Button (if still desired on this page) */}
      {viewMode !== 'candidate-detail' && <FloatingButton />}
    </Layout>
  );
};

export default Candidates;
