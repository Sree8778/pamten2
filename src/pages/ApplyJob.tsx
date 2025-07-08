// src/pages/ApplyJob.tsx
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout'; // Using relative path
import { Button } from '../components/ui/button'; // Using relative path
import { Input } from '../components/ui/input'; // Using relative path
import { Label } from '../components/ui/label'; // Using relative path
import { Textarea } from '../components/ui/textarea'; // Using relative path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'; // Using relative path
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload, Sparkles, Loader2, Mic, StopCircle, PlayCircle, XCircle, Send, Save,
  FileText, BriefcaseBusiness, GraduationCap, Award, User, Phone, Mail, MapPin, CheckCircle2,
  DollarSign, Clock, ListChecks, Building, Globe // Added icons for job details
} from 'lucide-react';

import { getFirebaseAuth, getCurrentUserId, getFirebaseDb, uploadFileToStorage, deleteFileFromStorage } from '../lib/firebase'; // Using relative path
import { collection, doc, getDoc, addDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns'; // For date formatting
import { Checkbox } from '../components/ui/checkbox'; // For Terms of Service

// Define Job interface (matching what's stored in Firestore, with all relevant fields)
interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  department?: string;
  description: string;
  status: 'Draft' | 'Published';
  postedAt: string; // ISO string
  recruiterId: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  deadline?: string; // ISO string
  relocationAssistance?: boolean;
  workArrangement?: 'On-site' | 'Hybrid' | 'Remote (Country)' | 'Remote (Global)' | '';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | '';
  experienceLevel?: 'Entry-Level' | 'Associate' | 'Mid-Level' | 'Senior' | 'Lead' | 'Manager' | 'Executive' | '';
  industry?: string;
  companyLogoUrl?: string;
  aboutCompany?: string; // New field from JobEditor
  companyWebsiteUrl?: string; // New field from JobEditor
  resumeUploadRequired?: boolean; // New field from JobEditor
  customScreeningQuestions?: string[]; // New field from JobEditor
  maxApplicantsLimit?: 'Unlimited' | '50' | '100' | '200' | ''; // New field from JobEditor
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

// Define Application interface
interface Application {
  id?: string;
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
  // For custom screening questions, responses would be stored here
  customQuestionResponses?: { [question: string]: string }; // NEW
}

const ApplyJob = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  const currentUserId = currentUser ? getCurrentUserId(currentUser) : '';
  const db = getFirebaseDb();

  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false); // For overall form submission/parsing
  const [applyError, setApplyError] = useState('');

  // Application form states
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [emailAddress, setEmailAddress] = useState(currentUser?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [elevatorPitchText, setElevatorPitchText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResumeData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false); // NEW: Terms of Service checkbox
  const [customQuestionResponses, setCustomQuestionResponses] = useState<{ [question: string]: string }>({}); // NEW

  // Video pitch states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoBlobs, setRecordedVideoBlobs] = useState<{ id: string; url: string; fileName: string; blob: Blob }[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const API_BASE_URL: string = 'http://127.0.0.1:5000/api';

  // Fetch job details and existing application draft on load
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!jobId || !db || !currentUserId) {
        toast.error("Job ID or user not available.");
        navigate('/jobs');
        return;
      }

      setLoadingJob(true);
      try {
        // Fetch job details
        const jobDocRef = doc(db, `artifacts/${getAppId()}/public/data/jobs`, jobId);
        const jobSnap = await getDoc(jobDocRef);
        if (jobSnap.exists()) {
          setJobDetails({ id: jobSnap.id, ...jobSnap.data() } as Job);
        } else {
          toast.error("Job not found.");
          navigate('/jobs');
          return;
        }

        // Fetch existing application draft for this job and user
        const existingAppQuery = query(
          collection(db, `artifacts/${getAppId()}/users/${currentUserId}/applications`),
          where("jobId", "==", jobId)
        );
        const existingAppSnap = await getDocs(existingAppQuery);

        if (!existingAppSnap.empty) {
          const existingAppData = { id: existingAppSnap.docs[0].id, ...existingAppSnap.docs[0].data() } as Application;
          setCoverLetter(existingAppData.coverLetter || '');
          setElevatorPitchText(existingAppData.elevatorPitchText || '');
          setPhoneNumber(existingAppData.applicantName.split(' - ')[1] || existingAppData.applicantName.split(' - ')[0] || ''); // Attempt to parse phone if stored in name
          setFullName(existingAppData.applicantName.split(' - ')[0] || existingAppData.applicantName); // Attempt to parse name
          setEmailAddress(existingAppData.applicantEmail || currentUser?.email || '');

          if (existingAppData.resumeUrl && existingAppData.resumeFileName) {
            setResumeFile(new File([], existingAppData.resumeFileName, { type: 'application/pdf' }));
          }
          if (existingAppData.elevatorPitchVideoUrl && existingAppData.elevatorPitchVideoFileName) {
            setRecordedVideoBlobs([{ id: 'existing', url: existingAppData.elevatorPitchVideoUrl, fileName: existingAppData.elevatorPitchVideoFileName, blob: new Blob() }]);
            setSelectedVideoId('existing');
          }
          if (existingAppData.parsedResumeContent) {
            setParsedResumeData(existingAppData.parsedResumeContent);
          }
          if (existingAppData.customQuestionResponses) {
            setCustomQuestionResponses(existingAppData.customQuestionResponses);
          }
          toast.info("Loaded previous application draft.");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load job or application data.");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchInitialData();
  }, [jobId, db, currentUserId, navigate, currentUser?.email, currentUser?.displayName]); // Added currentUser dependencies

  // Helper to get app ID from firebase config
  const getAppId = () => {
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    return firebaseConfig.projectId || 'default-app-id';
  };

  const handleResumeFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setLoadingContent(true);
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
      setParsedResumeData(null);
    } finally {
      setLoadingContent(false);
    }
  };

  // Video Pitch Handlers (same as before)
  const startRecording = async () => { /* ... */ };
  const stopRecording = () => { /* ... */ };
  const handleVideoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const handleRemoveVideo = (idToRemove: string) => { /* ... */ };
  const handleSelectVideo = (id: string) => { /* ... */ };

  const handleSubmitApplication = async (isSaveForLater: boolean) => { // Renamed isDraft to isSaveForLater for clarity
    if (!jobDetails || !currentUser || !currentUserId || !db) {
      setApplyError("Application data missing or user not authenticated.");
      toast.error("Application data missing or user not authenticated.");
      return;
    }

    if (!isSaveForLater) { // Only validate for final submission
        if (!fullName.trim() || !emailAddress.trim() || !phoneNumber.trim()) {
            setApplyError("Full Name, Email, and Phone Number are required.");
            toast.error("Full Name, Email, and Phone Number are required.");
            return;
        }
        if (!resumeFile && !(jobDetails.resumeUploadRequired === false)) { // If resume is required by job and not uploaded
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


    setLoadingContent(true);
    setApplyError('');

    try {
      let finalResumeUrl = resumeFile ? undefined : (existingApplication?.resumeUrl || undefined);
      let finalResumeFileName = resumeFile ? undefined : (existingApplication?.resumeFileName || undefined);

      if (resumeFile) {
        const resumePath = `resumes/${currentUserId}/${jobDetails.id}_${resumeFile.name}`;
        finalResumeUrl = await uploadFileToStorage(resumeFile, resumePath);
        finalResumeFileName = resumeFile.name;
        toast.success("Resume uploaded successfully!");
      }

      const selectedVideoBlobInfo = recordedVideoBlobs.find(v => v.id === selectedVideoId);
      let finalVideoPitchUrl = selectedVideoBlobInfo ? undefined : (existingApplication?.elevatorPitchVideoUrl || undefined);
      let finalVideoPitchFileName = selectedVideoBlobInfo ? undefined : (existingApplication?.elevatorPitchVideoFileName || undefined);

      if (selectedVideoBlobInfo && selectedVideoBlobInfo.blob) {
        const videoPath = `video_pitches/${currentUserId}/${jobDetails.id}_${selectedVideoBlobInfo.fileName || Date.now()}.webm`;
        finalVideoPitchUrl = await uploadFileToStorage(selectedVideoBlobInfo.blob, videoPath);
        finalVideoPitchFileName = selectedVideoBlobInfo.fileName;
        toast.success("Video pitch uploaded successfully!");
      } else if (!selectedVideoId && existingApplication?.elevatorPitchVideoUrl) {
          // If a video was previously attached but now deselected, clear it
          finalVideoPitchUrl = undefined;
          finalVideoPitchFileName = undefined;
      }


      const applicationStatus: Application['status'] = isSaveForLater ? 'Started Application' : 'Applied';
      const currentTimestamp = new Date().toISOString();

      const applicationData: Application = {
        jobId: jobDetails.id,
        jobTitle: jobDetails.jobTitle,
        companyName: jobDetails.companyName,
        applicantId: currentUserId,
        applicantEmail: emailAddress,
        applicantName: `${fullName} - ${phoneNumber}`, // Store name and phone
        resumeUrl: finalResumeUrl || null,
        resumeFileName: finalResumeFileName || null,
        coverLetter: coverLetter || null,
        elevatorPitchText: elevatorPitchText || null,
        elevatorPitchVideoUrl: finalVideoPitchUrl || null,
        elevatorPitchVideoFileName: finalVideoPitchFileName || null,
        status: applicationStatus,
        appliedAt: isSaveForLater ? (existingApplication?.appliedAt || null) : currentTimestamp,
        draftedAt: isSaveForLater ? currentTimestamp : (existingApplication?.draftedAt || null),
        submittedAt: isSaveForLater ? (existingApplication?.submittedAt || null) : currentTimestamp,
        parsedResumeContent: parsedResumeData || undefined,
        customQuestionResponses: customQuestionResponses, // Save custom question responses
      };

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

      if (existingApplication?.id) {
        const appDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/applications`, existingApplication.id);
        const { id, ...dataToUpdate } = applicationData;
        await updateDoc(appDocRef, dataToUpdate);
        toast.success(`Application ${isSaveForLater ? 'draft saved' : 'submitted'} successfully (updated existing)!`);
      } else {
        const { id, ...dataToAdd } = applicationData;
        await addDoc(collection(db, `artifacts/${appId}/users/${currentUserId}/applications`), dataToAdd);
        toast.success(`Application ${isSaveForLater ? 'draft saved' : 'submitted'} successfully (new)!`);
      }

      navigate('/jobs'); // Redirect back to job listings or a success page
    } catch (error: any) {
      setApplyError(error.message || `Failed to ${isSaveForLater ? 'save draft' : 'submit application'}.`);
      console.error(`Error ${isSaveForLater ? 'saving draft' : 'submitting application'}:`, error);
      toast.error(`Failed to ${isSaveForLater ? 'save draft' : 'submit application'}.`);
    } finally {
      setLoadingContent(false);
    }
  };

  if (loadingJob || !jobDetails) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 rounded-xl shadow-lg">
          <Loader2 className="h-16 w-16 text-gray-700 animate-spin" />
          <p className="text-xl text-gray-700 mt-4">Loading job details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Apply for Job</h1>
        <p className="text-sm text-gray-500">Complete your application for: {jobDetails.jobTitle} at {jobDetails.companyName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breadcrumbs (Mock) */}
          <div className="text-sm text-gray-500 mb-4">
            Home &gt; Jobs &gt; {jobDetails.jobTitle}
          </div>

          {/* Job Header */}
          <div className="flex items-center mb-4">
            {jobDetails.companyLogoUrl ? (
              <img src={jobDetails.companyLogoUrl} alt={`${jobDetails.companyName} logo`} className="w-12 h-12 rounded-full mr-3 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <Building size={24} className="text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{jobDetails.jobTitle}</h1>
              <p className="text-md text-gray-600">{jobDetails.companyName}</p>
            </div>
          </div>

          {/* Job Meta Info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 mb-6">
            <p className="flex items-center gap-1">
              <MapPin size={16} /> {jobDetails.location}
              {jobDetails.workArrangement && ` (${jobDetails.workArrangement})`}
            </p>
            {(jobDetails.salaryMin || jobDetails.salaryMax) ? (
              <p className="flex items-center gap-1 font-semibold text-green-700">
                <DollarSign size={16} /> ${jobDetails.salaryMin?.toLocaleString()} - ${jobDetails.salaryMax?.toLocaleString()} / year
              </p>
            ) : null}
            {jobDetails.employmentType && (
              <p className="flex items-center gap-1">
                <BriefcaseBusiness size={16} /> {jobDetails.employmentType}
              </p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Job Description</h2>
            <div className="text-sm text-gray-700 quill-content" dangerouslySetInnerHTML={{ __html: jobDetails.description }}></div>
          </div>

          {/* Required Skills */}
          {jobDetails.skills && Array.isArray(jobDetails.skills) && jobDetails.skills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {jobDetails.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities (part of description, but can be pulled out if structured) */}
          {/* Qualifications (part of description, but can be pulled out if structured) */}
          {/* Benefits (NEW section) */}
          {/* Assuming benefits are part of description or a new field. For now, mock or pull from description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Benefits</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Comprehensive health, dental, and vision insurance.</li>
              <li>Generous paid time off and flexible work arrangements.</li>
              <li>401(k) with company match.</li>
              <li>Professional development budget and opportunities.</li>
              <li>On-site gym and wellness programs.</li>
              <li>Commuter benefits.</li>
            </ul>
          </div>

          {/* About Company */}
          {jobDetails.aboutCompany && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">About {jobDetails.companyName}</h2>
              <p className="text-sm text-gray-700">{jobDetails.aboutCompany}</p>
              {jobDetails.companyWebsiteUrl && (
                <a href={jobDetails.companyWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  View Company Profile
                </a>
              )}
            </div>
          )}

          {/* Mock Views and Applicants */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-6">
            <p className="flex items-center gap-1">
              <Eye size={16} /> 3,456 Views
            </p>
            <p className="flex items-center gap-1">
              <Users size={16} /> 128 Applicants
            </p>
          </div>
        </div>

        {/* Right Column: Apply Form & Similar Jobs */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 shadow-lg border border-gray-200 sticky top-4"> {/* Sticky for scrolling */}
            <CardTitle className="text-xl font-bold mb-4">Apply for this Job</CardTitle>
            <div className="space-y-4">
              {applyError && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{applyError}</div>}

              {/* Personal Info */}
              <div>
                <Label htmlFor="fullName" className="mb-1 block text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loadingContent}
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
                  disabled={loadingContent}
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
                  disabled={loadingContent}
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
                  disabled={loadingContent}
                />
                {resumeFile && <p className="text-sm text-gray-600 mt-1">Selected: {resumeFile.name}</p>}
                {parsedResumeData && (
                  <div className="mt-2 p-2 border rounded-md bg-green-50 text-green-700 text-xs flex items-center">
                    <CheckCircle2 size={16} className="mr-1" /> Resume parsed successfully!
                  </div>
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
                  disabled={loadingContent}
                />
              </div>

              {/* Custom Screening Questions */}
              {jobDetails.customScreeningQuestions && jobDetails.customScreeningQuestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Screening Questions</h3>
                  {jobDetails.customScreeningQuestions.map((question, index) => (
                    <div key={index}>
                      <Label htmlFor={`question-${index}`} className="mb-1 block text-sm font-medium">{question}</Label>
                      <Input
                        id={`question-${index}`}
                        value={customQuestionResponses[question] || ''}
                        onChange={(e) => setCustomQuestionResponses(prev => ({ ...prev, [question]: e.target.value }))}
                        disabled={loadingContent}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Terms of Service */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  disabled={loadingContent}
                />
                <Label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </Label>
              </div>

              <Button onClick={() => handleSubmitApplication(false)} disabled={loadingContent} className="w-full">
                {loadingContent ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Submit Application
              </Button>
              <Button onClick={() => handleSubmitApplication(true)} disabled={loadingContent} variant="outline" className="w-full">
                {loadingContent ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                Save for Later
              </Button>
            </div>
          </Card>

          {/* Similar Jobs Section */}
          <Card className="p-6 shadow-lg border border-gray-200">
            <CardTitle className="text-xl font-bold mb-4">Similar Jobs</CardTitle>
            <div className="space-y-4">
              {/* Mock Similar Jobs */}
              <div className="space-y-2">
                <p className="font-semibold text-sm">Frontend Developer (Mid-Level)</p>
                <p className="text-xs text-gray-600">Global Solutions Co. • Remote</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm">UI/UX Engineer</p>
                <p className="text-xs text-gray-600">Creative Digital Agency • New York, NY</p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-sm">Full Stack Engineer (React/Node)</p>
                <p className="text-xs text-gray-600">Data Insights Corp. • Austin, TX</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ApplyJob;
