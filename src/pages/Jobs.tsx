// src/pages/Jobs.tsx
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout'; // Using alias
import FloatingButton from '@/components/FloatingButton'; // Using alias
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select components
import { Textarea } from '@/components/ui/textarea'; // Keep if needed for modal, otherwise remove
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // FIXED: Re-added Dialog imports and corrected syntax
import {
  Search, MapPin, DollarSign, Building, BriefcaseBusiness, Send, CalendarIcon, UploadCloud, Save, Mic, StopCircle, PlayCircle, XCircle, CheckCircle2,
  Filter, ChevronDown, ChevronUp, Clock, FileText, ListChecks, Globe
} from 'lucide-react';
import { useUserRole } from '@/contexts/UserRoleContext';
import { getFirebaseAuth, getCurrentUserId, getAllPublicJobs, getFirebaseDb, uploadFileToStorage, deleteFileFromStorage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


// Define Job interface (updated with new fields for filtering)
interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  department: string;
  description: string;
  status: 'Draft' | 'Published';
  postedAt: string; // ISO string
  recruiterId: string;
  salaryMin?: number; // Changed to number
  salaryMax?: number; // Changed to number
  skills?: string[]; // Changed to array
  deadline?: string; // ISO string
  relocationAssistance?: boolean;
  workArrangement?: 'On-site' | 'Hybrid' | 'Remote (Country)' | 'Remote (Global)' | '';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | ''; // NEW
  experienceLevel?: 'Entry-Level' | 'Associate' | 'Mid-Level' | 'Senior' | 'Lead' | 'Manager' | 'Executive' | ''; // NEW
  industry?: string; // NEW
  companyLogoUrl?: string; // NEW
  aboutCompany?: string; // NEW
  companyWebsiteUrl?: string; // NEW
}

// Define parsed resume data structure (matching backend parsing output)
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

// Define Application interface (UPDATED with new fields for resume & video URLs)
interface Application {
  id?: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  resumeUrl?: string; // URL to candidate's resume in storage
  resumeFileName?: string;
  coverLetter?: string;
  elevatorPitchText?: string;
  elevatorPitchVideoUrl?: string; // Single URL for the selected video pitch
  elevatorPitchVideoFileName?: string;
  status: 'Started Application' | 'Applied' | 'Under Review' | 'Interviewing' | 'Rejected' | 'Hired';
  appliedAt?: string; // ISO string
  draftedAt?: string; // ISO string
  submittedAt?: string; // ISO string
  parsedResumeContent?: ParsedResumeData; // Added parsed resume content
  // NEW: Add specific parsed sections to Application interface
  parsedExperience?: Array<{ jobTitle?: string; company?: string; dates?: string; description?: string; }>;
  parsedProjects?: Array<{ title?: string; date?: string; description?: string; }>;
  parsedSkills?: Array<{ category?: string; skills_list?: string; }>;
  parsedEducation?: Array<{ degree?: string; institution?: string; graduationYear?: string; gpa?: string; achievements?: string; }>;
  parsedCertifications?: Array<{ name?: string; issuer?: string; date?: string; }>;
  parsedPublications?: Array<{ title?: string; authors?: string; journal?: string; date?: string; link?: string; }>;
}


const Jobs = () => {
  const { userRole, isLoadingRole } = useUserRole();
  const navigate = useNavigate(); // Initialize navigate
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  const currentUserId = currentUser ? getCurrentUserId(currentUser) : '';
  const db = getFirebaseDb();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [userApplications, setUserApplications] = useState<any[]>([]); // To track applied jobs
  const [recentlyViewedJobs, setRecentlyViewedJobs] = useState<Job[]>([]);

  // States for Apply Modal (re-integrated)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null);
  const [fullName, setFullName] = useState(currentUser?.displayName || ''); // Added for modal form
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || ''); // Added for modal form
  const [phoneNumber, setPhoneNumber] = useState(''); // Added for modal form
  const [coverLetter, setCoverLetter] = useState('');
  const [elevatorPitchText, setElevatorPitchText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResumeData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false); // Added for modal form

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoBlobs, setRecordedVideoBlobs] = useState<{ id: string; url: string; fileName: string; blob: Blob }[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);

  const API_BASE_URL: string = 'http://127.0.0.1:5000/api';

  // Filter States (Simplified: removed industryFilter and salaryRangeFilter)
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [locationTypes, setLocationTypes] = useState<string[]>([]);


  const fetchPublicJobs = async () => {
    setLoadingJobs(true);
    try {
      const fetchedJobs = await getAllPublicJobs();
      setJobs(fetchedJobs as Job[]);
    } catch (error) {
      console.error("Error fetching public jobs:", error);
      toast.error("Failed to load job listings.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!currentUserId) return;
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const applicationsRef = collection(db, `artifacts/${appId}/users/${currentUserId}/applications`);
      const q = query(applicationsRef, where("applicantId", "==", currentUserId));
      const querySnapshot = await getDocs(q);
      const applications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Application[];
      setUserApplications(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
    }
  };

  // NEW: Effect to load recently viewed jobs from localStorage
  useEffect(() => {
    const storedRecentlyViewed = localStorage.getItem('recentlyViewedJobs');
    if (storedRecentlyViewed) {
      try {
        setRecentlyViewedJobs(JSON.parse(storedRecentlyViewed));
      } catch (e) {
        console.error("Error parsing recently viewed jobs from localStorage:", e);
        localStorage.removeItem('recentlyViewedJobs'); // Clear corrupted data
      }
    }
  }, []);

  // NEW: Function to add a job to recently viewed
  const addJobToRecentlyViewed = (job: Job) => {
    setRecentlyViewedJobs(prev => {
      const updated = [job, ...prev.filter(j => j.id !== job.id)].slice(0, 5); // Keep up to 5 unique jobs
      localStorage.setItem('recentlyViewedJobs', JSON.stringify(updated));
      return updated;
    });
  };


  useEffect(() => {
    fetchPublicJobs();
    if (currentUser) {
      fetchUserApplications();
    }
  }, [currentUser]);

  const isJobApplied = (jobId: string) => {
    return userApplications.some(app => app.jobId === jobId && app.status === 'Applied');
  };

  const fetchExistingApplication = async (jobId: string) => {
    if (!currentUserId || !db) return null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const applicationsRef = collection(db, `artifacts/${appId}/users/${currentUserId}/applications`);
    const q = query(applicationsRef, where("jobId", "==", jobId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const appData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Application;
      setExistingApplication(appData);
      setCoverLetter(appData.coverLetter || '');
      setElevatorPitchText(appData.elevatorPitchText || '');
      // Attempt to pre-fill personal info from existing application or current user
      setFullName(appData.applicantName.split(' - ')[0] || currentUser?.displayName || '');
      setEmailAddress(appData.applicantEmail || currentUser?.email || '');
      setPhoneNumber(appData.applicantName.split(' - ')[1] || ''); // Assuming phone is part of applicantName

      if (appData.parsedResumeContent) {
        setParsedResumeData(appData.parsedResumeContent);
      }
      if (appData.elevatorPitchVideoUrl && appData.elevatorPitchVideoFileName) {
        setRecordedVideoBlobs(prev => {
          if (!prev.some(v => v.id === 'existing')) {
            return [...prev, { id: 'existing', url: appData.elevatorPitchVideoUrl, fileName: appData.elevatorPitchVideoFileName, blob: new Blob() }];
          }
          return prev;
        });
        setSelectedVideoId('existing');
      }
      return appData;
    }
    return null;
  };

  const getAppId = () => {
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    return firebaseConfig.projectId || 'default-app-id';
  };

  const handleApplyClick = async (job: Job) => {
    if (!currentUser) {
      toast.error("Please log in to apply for jobs.");
      return;
    }
    setSelectedJobToApply(job);
    // Reset form states for new/draft application
    setCoverLetter('');
    setElevatorPitchText('');
    setResumeFile(null);
    setParsedResumeData(null);
    setRecordedVideoBlobs([]);
    setSelectedVideoId(null);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setApplyError('');
    setIsApplying(false);

    // Fetch existing draft for this job and populate form
    const existingApp = await fetchExistingApplication(job.id);
    if (existingApp) {
      console.log("Found existing application draft:", existingApp);
    } else {
      setExistingApplication(null); // No existing app found
    }

    setIsApplyModalOpen(true); // Open the modal
  };

  const handleJobCardClick = (job: Job) => {
    addJobToRecentlyViewed(job);
    // You might want to open a job detail modal here, or navigate to a job detail page
    // For now, it just tracks the view.
  };

  const handleResumeFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsApplying(true); // Use isApplying for loading state
    setApplyError('');
    toast.info("Parsing resume...", { id: 'resume-parse' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/parse-resume`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }
      const result = await response.json();
      setParsedResumeData(result.parsedData);
      // Auto-fill name, email, phone from parsed resume if not already filled
      if (!fullName && result.parsedData?.personal?.name) setFullName(result.parsedData.personal.name);
      if (!emailAddress && result.parsedData?.personal?.email) setEmailAddress(result.parsedData.personal.email);
      if (!phoneNumber && result.parsedData?.personal?.phone) setPhoneNumber(result.parsedData.personal.phone);

      toast.success("Resume parsed successfully!", { id: 'resume-parse' });
    } catch (error: any) {
      toast.error(`Failed to parse resume: ${error.message}`, { id: 'resume-parse' });
      setApplyError(`Failed to parse resume: ${error.message}`);
      setParsedResumeData(null); // Clear parsed data on error
    } finally {
      setIsApplying(false); // Reset loading state
    }
  };

  // --- Video Pitch Handlers ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setIsRecording(true);
      setApplyError(''); // Clear any previous errors

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size > 0) { chunks.push(event.data); } };
      recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const newVideoId = crypto.randomUUID();
          const fileName = `video_pitch_${newVideoId.substring(0, 8)}.webm`;

          setRecordedVideoBlobs(prev => [...prev, { id: newVideoId, url, fileName, blob }]);
          setSelectedVideoId(newVideoId);
          stream.getTracks().forEach(track => track.stop());
          if (videoRef.current) videoRef.current.srcObject = null; // Clear live stream
      };
      recorder.start();
    } catch (err: any) {
      setApplyError("Could not access camera/microphone. Please check permissions: " + err.message);
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') { mediaRecorderRef.current.stop(); }
    setIsRecording(false);
  };

  const handleVideoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newVideoId = crypto.randomUUID();
      setRecordedVideoBlobs(prev => [...prev, { id: newVideoId, url, fileName: file.name, blob: file }]);
      setSelectedVideoId(newVideoId);
      setApplyError('');
      console.log("Video file selected:", file.name);
      event.target.value = '';
    }
  };

  const handleRemoveVideo = (idToRemove: string) => {
    // Revoke URL to free up memory
    const videoToRemove = recordedVideoBlobs.find(v => v.id === idToRemove);
    if (videoToRemove && videoToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(videoToRemove.url);
    }
    setRecordedVideoBlobs(prev => prev.filter(video => video.id !== idToRemove));
    if (selectedVideoId === idToRemove) {
      setSelectedVideoId(null);
    }
  };

  const handleSelectVideo = (id: string) => {
    setSelectedVideoId(id);
    const selectedVideo = recordedVideoBlobs.find(v => v.id === id);
    if (videoRef.current && selectedVideo) {
      videoRef.current.src = selectedVideo.url;
      videoRef.current.load(); // Reload video source
      videoRef.current.play().catch(error => console.error("Video auto-play failed:", error)); // Auto-play with error handling
    }
  };
  // --- End Video Pitch Handlers ---


  const handleSubmitApplication = async (isDraft: boolean) => {
    if (!selectedJobToApply || !currentUser || !currentUserId || !db) {
      setApplyError("Application data missing or user not authenticated.");
      toast.error("Application data missing or user not authenticated.");
      return;
    }

    if (!isDraft) { // Only validate for final submission
        if (!fullName.trim() || !emailAddress.trim() || !phoneNumber.trim()) {
            setApplyError("Full Name, Email, and Phone Number are required.");
            toast.error("Full Name, Email, and Phone Number are required.");
            return;
        }
        // Check if resume is required by job and not uploaded (or existing)
        if (selectedJobToApply.resumeUploadRequired && !resumeFile && !(existingApplication?.resumeUrl)) {
            setApplyError("Please upload your resume.");
            toast.error("Resume is required for final submission.");
            return;
        }
        if (!termsAccepted) {
            setApplyError("You must agree to the Terms of Service and Privacy Policy.");
            toast.error("Please accept terms to submit.");
            return;
        }
    }


    setIsApplying(true);
    setApplyError('');

    try {
      // REMOVED: Resume file upload to Firebase Storage
      let finalResumeUrl = null; // Set to null as we are not storing resumes
      let finalResumeFileName = resumeFile?.name || null; // Still keep filename for record

      // REMOVED: Video pitch file upload to Firebase Storage
      let finalVideoPitchUrl = null; // Set to null as we are not storing video pitches
      let finalVideoPitchFileName = selectedVideoId ? (recordedVideoBlobs.find(v => v.id === selectedVideoId)?.fileName || null) : null;


      const applicationStatus: Application['status'] = isDraft ? 'Started Application' : 'Applied';
      const currentTimestamp = new Date().toISOString();

      const applicationData: Application = {
        jobId: selectedJobToApply.id,
        jobTitle: selectedJobToApply.jobTitle,
        companyName: selectedJobToApply.companyName,
        applicantId: currentUserId,
        applicantEmail: emailAddress, // Use state variable
        applicantName: `${fullName} - ${phoneNumber}`, // Use state variables
        resumeUrl: finalResumeUrl, // Will be null
        resumeFileName: finalResumeFileName, // Will be filename or null
        coverLetter: coverLetter || null,
        elevatorPitchText: elevatorPitchText || null,
        elevatorPitchVideoUrl: finalVideoPitchUrl, // Will be null
        elevatorPitchVideoFileName: finalVideoPitchFileName, // Will be filename or null
        status: applicationStatus,
        appliedAt: isDraft ? (existingApplication?.appliedAt || null) : currentTimestamp,
        draftedAt: isDraft ? currentTimestamp : (existingApplication?.draftedAt || null),
        submittedAt: isDraft ? (existingApplication?.submittedAt || null) : currentTimestamp,
        parsedResumeContent: parsedResumeData || undefined,
        parsedExperience: parsedResumeData?.experience || undefined, // NEW: Include parsed experience
        parsedProjects: parsedResumeData?.projects || undefined,     // NEW: Include parsed projects
        parsedSkills: parsedResumeData?.skills || undefined,         // NEW: Include parsed skills
        parsedEducation: parsedResumeData?.education || undefined,   // NEW: Include parsed education
        parsedCertifications: parsedResumeData?.certifications || undefined, // NEW: Include parsed certifications
        parsedPublications: parsedResumeData?.publications || undefined, // NEW: Include parsed publications
      };

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      console.log("Saving application data to Firestore (no files stored):", applicationData);
      if (existingApplication?.id) {
        const appDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/applications`, existingApplication.id);
        const { id, ...dataToUpdate } = applicationData;
        await updateDoc(appDocRef, dataToUpdate);
        toast.success(`Application ${isDraft ? 'draft saved' : 'submitted'} successfully (updated existing)!`);
      } else {
        // FIXED: Define dataToAdd here
        const { id, ...dataToAdd } = applicationData;
        await addDoc(collection(db, `artifacts/${appId}/users/${currentUserId}/applications`), dataToAdd);
        toast.success(`Application ${isDraft ? 'draft saved' : 'submitted'} successfully (new)!`);
      }

      setIsApplyModalOpen(false);
      // Removed fetchUserApplications() here as it's not needed for this component directly
    } catch (error: any) {
      setApplyError(error.message || `Failed to ${isDraft ? 'save draft' : 'submit application'}.`);
      console.error(`Error ${isDraft ? 'saving draft' : 'submitting application'}:`, error);
      toast.error(`Failed to ${isDraft ? 'save draft' : 'submit application'}.`);
    } finally {
      setIsApplying(false);
    }
  };

  // Filtered Jobs Logic
  const filteredJobs = jobs.filter(job => {
    const matchesKeywords =
      (job.jobTitle?.toLowerCase().includes(searchKeywords.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchKeywords.toLowerCase()) ||
      (job.skills && Array.isArray(job.skills) && job.skills.some(skill => skill.toLowerCase().includes(searchKeywords.toLowerCase()))) ||
      job.companyName?.toLowerCase().includes(searchCompany.toLowerCase()));

    const matchesCompany = searchCompany ? job.companyName?.toLowerCase().includes(searchCompany.toLowerCase()) : true;
    const matchesLocation = searchLocation ? job.location?.toLowerCase().includes(searchLocation.toLowerCase()) : true;

    const matchesJobType = jobTypes.length > 0 ? jobTypes.includes(job.employmentType || '') : true;
    const matchesExperienceLevel = experienceLevels.length > 0 ? experienceLevels.includes(job.experienceLevel || '') : true;
    const matchesLocationType = locationTypes.length > 0 ? locationTypes.includes(job.workArrangement || '') : true;
    // Removed industry and salary filters from matching logic
    const matchesIndustry = true; // Always true since filter is removed
    const matchesSalary = true; // Always true since filter is removed

    return matchesKeywords && matchesCompany && matchesLocation && matchesJobType && matchesExperienceLevel && matchesLocationType && matchesIndustry && matchesSalary;
  });


  if (isLoadingRole || loadingJobs) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full min-h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="ml-4 text-gray-700 mt-4">Loading job listings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (userRole && userRole !== 'candidate' && userRole !== 'recruiter' && userRole !== 'admin') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full min-h-[500px]">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You do not have permission to view job listings.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Top Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-md mb-6">
        <Input
          type="text"
          placeholder="Search by job title or keyword..."
          className="flex-1"
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Company name..."
          className="flex-1"
          value={searchCompany}
          onChange={(e) => setSearchCompany(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Location (city, state, remote)..."
          className="flex-1"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <Button className="w-full md:w-auto">
          <Search size={18} className="mr-2" /> Search
        </Button>
        <Button variant="outline" className="w-full md:w-auto">
          <Filter size={18} className="mr-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Job Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4 shadow-sm border border-gray-200">
            <CardTitle className="text-lg font-bold mb-4">Job Filters</CardTitle>
            <div className="space-y-4">
              {/* Job Type Filter */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Job Type</h3>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                    <div key={type} className="flex items-center">
                      <Checkbox
                        id={`job-type-${type}`}
                        checked={jobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setJobTypes(prev =>
                            checked ? [...prev, type] : prev.filter(t => t !== type)
                          );
                        }}
                      />
                      <Label htmlFor={`job-type-${type}`} className="ml-2 text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level Filter */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Experience Level</h3>
                <div className="space-y-2">
                  {['Entry-Level', 'Mid-Level', 'Senior', 'Director'].map(level => (
                    <div key={level} className="flex items-center">
                      <Checkbox
                        id={`exp-level-${level}`}
                        checked={experienceLevels.includes(level)}
                        onCheckedChange={(checked) => {
                          setExperienceLevels(prev =>
                            checked ? [...prev, level] : prev.filter(l => l !== level)
                          );
                        }}
                      />
                      <Label htmlFor={`exp-level-${level}`} className="ml-2 text-sm">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Type Filter */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location Type</h3>
                <div className="space-y-2">
                  {['Remote (Global)', 'On-site', 'Hybrid'].map(type => (
                    <div key={type} className="flex items-center">
                      <Checkbox
                        id={`loc-type-${type}`}
                        checked={locationTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setLocationTypes(prev =>
                            checked ? [...prev, type] : prev.filter(l => l !== type)
                          );
                        }}
                      />
                      <Label htmlFor={`loc-type-${type}`} className="ml-2 text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Removed Industry Filter */}
              {/* Removed Salary Range Filter */}

              <Button className="w-full">Apply Filters</Button>
              <Button variant="outline" className="w-full" onClick={() => {
                setSearchKeywords('');
                setSearchCompany('');
                setSearchLocation('');
                setJobTypes([]);
                setExperienceLevels([]);
                setLocationTypes([]);
                // Reset removed filters to default if they were here
              }}>Clear All</Button>
            </div>
          </Card>
        </div>

        {/* Right Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recently Viewed Jobs Section */}
          {recentlyViewedJobs.length > 0 && ( // Only show if there are recently viewed jobs
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Viewed Jobs</h2>
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {recentlyViewedJobs.map(job => (
                  <Card key={job.id} className="min-w-[280px] border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => handleJobCardClick(job)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-bold">{job.jobTitle}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{job.companyName}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-700">
                      <p className="flex items-center gap-1"><MapPin size={14} /> {job.location}</p>
                      {job.postedAt && <p className="flex items-center gap-1"><Clock size={14} /> {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Job Listings */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Available Job Listings ({filteredJobs.length})</h2>
            <div className="flex items-center space-x-2">
              <Label htmlFor="sort-by" className="text-sm">Sort by:</Label>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date Posted</SelectItem>
                  <SelectItem value="salary-high">Salary (High to Low)</SelectItem>
                  <SelectItem value="salary-low">Salary (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                <BriefcaseBusiness size={40} className="mx-auto mb-4" />
                <p className="text-lg font-medium">No job listings match your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your filters!</p>
              </div>
            ) : (
              filteredJobs.map(job => (
                <Card key={job.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200" onClick={() => handleJobCardClick(job)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {job.companyLogoUrl ? (
                          <img src={job.companyLogoUrl} alt={`${job.companyName} logo`} className="w-8 h-8 rounded-full mr-2 object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <Building size={16} className="text-gray-500" />
                          </div>
                        )}
                        <CardTitle className="text-lg font-bold text-gray-800">{job.jobTitle}</CardTitle>
                      </div>
                      {isJobApplied(job.id) && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Applied</Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm text-gray-600 mt-1">{job.companyName}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3" dangerouslySetInnerHTML={{ __html: job.description }}></p>

                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="flex items-center gap-1">
                        <MapPin size={14} /> {job.location}
                      </p>
                      {(job.salaryMin || job.salaryMax) ? (
                        <p className="flex items-center gap-1 font-semibold text-green-700">
                          <DollarSign size={14} /> ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                        </p>
                      ) : null}
                      {job.postedAt && (
                        <p className="flex items-center gap-1 text-gray-500">
                          <Clock size={14} /> {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                        </p>
                      )}
                      {job.employmentType && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <BriefcaseBusiness size={14} /> {job.employmentType}
                        </p>
                      )}
                      {job.experienceLevel && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <BriefcaseBusiness size={14} /> {job.experienceLevel}
                        </p>
                      )}
                      {job.workArrangement && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <BriefcaseBusiness size={14} /> {job.workArrangement}
                        </p>
                      )}
                      {job.relocationAssistance && (
                        <p className="flex items-center gap-1 text-gray-600">
                          <Globe size={14} /> Relocation Assistance
                        </p>
                      )}
                      {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                        <p className="flex items-start gap-1 text-gray-600">
                          <ListChecks size={14} className="mt-0.5" /> Skills: {job.skills.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      {userRole === 'candidate' && (
                        <>
                          <Button size="sm" onClick={() => handleApplyClick(job)}>
                            <Send size={16} className="mr-1" /> Apply
                          </Button>
                          <Button variant="outline" size="sm">
                            <Save size={16} className="mr-1" /> Save
                          </Button>
                        </>
                      )}
                      {userRole === 'recruiter' && (
                        <Button variant="outline" size="sm" disabled>
                          Recruiter View
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingButton />

      {/* Apply Job Modal (re-integrated) */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-6 max-h-full overflow-y-auto"> {/* Increased max-width for two columns */}
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">Apply for {selectedJobToApply?.jobTitle}</DialogTitle>
            <DialogDescription className="text-md text-gray-600">
              Submit your application for this position at {selectedJobToApply?.companyName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-t border-b border-gray-200 my-4 flex-grow overflow-y-auto pr-3">
            {/* Left Column: Job Details within Modal */}
            <div className="md:col-span-1 space-y-4">
                {/* Job Header within Modal */}
                <div className="flex items-center">
                    {selectedJobToApply?.companyLogoUrl ? (
                        <img src={selectedJobToApply.companyLogoUrl} alt={`${selectedJobToApply.companyName} logo`} className="w-10 h-10 rounded-full mr-2 object-contain" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <Building size={18} className="text-gray-500" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-lg font-bold">{selectedJobToApply?.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{selectedJobToApply?.companyName}</p>
                    </div>
                </div>

                {/* Job Meta Info within Modal */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
                    <p className="flex items-center gap-1">
                        <MapPin size={12} /> {selectedJobToApply?.location}
                        {selectedJobToApply?.workArrangement && ` (${selectedJobToApply.workArrangement})`}
                    </p>
                    {(selectedJobToApply?.salaryMin || selectedJobToApply?.salaryMax) ? (
                        <p className="flex items-center gap-1 font-semibold text-green-700">
                            <DollarSign size={12} /> ${selectedJobToApply.salaryMin?.toLocaleString()} - ${selectedJobToApply.salaryMax?.toLocaleString()}
                        </p>
                    ) : null}
                    {selectedJobToApply?.employmentType && (
                        <p className="flex items-center gap-1">
                            <BriefcaseBusiness size={12} /> {selectedJobToApply.employmentType}
                        </p>
                    )}
                </div>

                {/* Job Description within Modal */}
                <div className="space-y-2">
                    <h4 className="text-md font-bold text-gray-800">Job Description</h4>
                    <div className="text-xs text-gray-700 max-h-[120px] overflow-y-auto quill-content" dangerouslySetInnerHTML={{ __html: selectedJobToApply?.description || '' }}></div>
                </div>

                {/* Required Skills within Modal */}
                {selectedJobToApply?.skills && Array.isArray(selectedJobToApply.skills) && selectedJobToApply.skills.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-md font-bold text-gray-800">Required Skills</h4>
                        <div className="flex flex-wrap gap-1">
                            {selectedJobToApply.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                {/* Benefits (Mock for now) */}
                <div className="space-y-2">
                    <h4 className="text-md font-bold text-gray-800">Benefits</h4>
                    <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                        <li>Comprehensive health, dental, and vision insurance.</li>
                        <li>Generous paid time off and flexible work arrangements.</li>
                        <li>401(k) with company match.</li>
                        <li>Professional development budget and opportunities.</li>
                    </ul>
                </div>

                {/* About Company (Mock for now) */}
                {selectedJobToApply?.aboutCompany && (
                    <div className="space-y-2">
                        <h4 className="text-md font-bold text-gray-800">About {selectedJobToApply.companyName}</h4>
                        <p className="text-xs text-gray-700">{selectedJobToApply.aboutCompany}</p>
                        {selectedJobToApply.companyWebsiteUrl && (
                            <a href={selectedJobToApply.companyWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                View Company Profile
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Right Column: Application Form within Modal */}
            <div className="md:col-span-1 space-y-4">
                {applyError && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{applyError}</div>}

                {/* Personal Info */}
                <div>
                    <Label htmlFor="fullName" className="mb-1 block text-sm font-medium">Full Name</Label>
                    <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        disabled={isApplying}
                    />
                </div>
                <div>
                    <Label htmlFor="emailAddress" className="mb-1 block text-sm font-medium">Email Address</Label>
                    <Input
                        id="emailAddress"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="john.doe@example.com"
                        disabled={isApplying}
                    />
                </div>
                <div>
                    <Label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium">Phone Number</Label>
                    <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="(555) 123-4567"
                        disabled={isApplying}
                    />
                </div>

                {/* Resume Upload */}
                <div>
                    <Label htmlFor="resume-upload" className="mb-1 block text-sm font-medium">Resume</Label>
                    <Input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleResumeFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isApplying}
                    />
                    {resumeFile && <p className="text-sm text-gray-600 mt-1">Selected: {resumeFile.name}</p>}
                    {parsedResumeData && (
                        <div className="mt-2 p-2 border rounded-md bg-green-50 text-green-700 text-xs flex items-center">
                            <CheckCircle2 size={16} className="mr-1" /> Resume parsed successfully!
                        </div>
                    )}
                    {existingApplication?.resumeFileName && !resumeFile && (
                        <p className="text-sm text-gray-500 mt-1">Currently attached: {existingApplication.resumeFileName} (Re-upload to change)</p>
                    )}
                </div>

                {/* Cover Letter */}
                <div>
                    <Label htmlFor="cover-letter" className="mb-1 block text-sm font-medium">Cover Letter (Optional)</Label>
                    <Textarea
                        id="cover-letter"
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Introduce yourself and explain your interest in this role..."
                        disabled={isApplying}
                    />
                </div>

                {/* Terms of Service */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                        disabled={isApplying}
                    />
                    <Label htmlFor="terms" className="text-xs text-gray-600">
                        I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                    </Label>
                </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)} disabled={isApplying}>Cancel</Button>
            <Button onClick={() => handleSubmitApplication(true)} disabled={isApplying} variant="secondary">
              {isApplying ? <><span className="animate-spin mr-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-8-8c-2.906 0-5.657 1.26-7.657 3.343m1.066 1.065c-2.333 2.334-3.5 5.65-3.5 9.176 0 2.213.784 4.316 2.188 5.922"></path></svg></span> Saving Draft...</> : <><Save size={16} className="mr-2" /> Save Draft</>}
            </Button>
            <Button onClick={() => handleSubmitApplication(false)} disabled={isApplying}>
              {isApplying ? <><span className="animate-spin mr-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-8-8c-2.906 0-5.657 1.26-7.657 3.343m1.066 1.065c-2.333 2.334-3.5 5.65-3.5 9.176 0 2.213.784 4.316 2.188 5.922"></path></svg></span> Submitting...</> : <><Send size={16} className="mr-2" /> Submit Application</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Jobs;
