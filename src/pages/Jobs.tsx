// src/pages/Jobs.tsx
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import Layout from '@/components/layout/Layout';
import FloatingButton from '@/components/FloatingButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Keep Dialog components
import { Search, MapPin, DollarSign, Building, BriefcaseBusiness, Send, CalendarIcon, UploadCloud, Save, Mic, StopCircle, PlayCircle, XCircle } from 'lucide-react'; // Added Save, Mic, StopCircle, PlayCircle, XCircle
import { useUserRole } from '@/contexts/UserRoleContext';
import { getFirebaseAuth, getCurrentUserId, getAllPublicJobs } from '@/lib/firebase';
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils'; // Import the cn utility function
import { toast } from 'sonner';
// For Date Formatting
import { format } from 'date-fns';

// Define Job interface
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
  salary?: string;
  skills?: string;
  deadline?: string;
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
  appliedAt?: string;
  draftedAt?: string;
  submittedAt?: string;
}

const Jobs = () => {
  const { userRole, isLoadingRole } = useUserRole();
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  const currentUserId = currentUser ? getCurrentUserId(currentUser) : '';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  // States for Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [elevatorPitchText, setElevatorPitchText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  // States for Video Pitch: allowing multiple recordings/uploads
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoBlobs, setRecordedVideoBlobs] = useState<{ id: string; url: string; fileName: string; blob: Blob }[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null); // To play a specific video
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [existingApplication, setExistingApplication] = useState<Application | null>(null); // State for existing draft


  const fetchPublicJobs = async () => {
    setLoadingJobs(true);
    try {
      const fetchedJobs = await getAllPublicJobs();
      setJobs(fetchedJobs as Job[]);
    } catch (error) {
      console.error("Error fetching public jobs:", error);
      // Display error to user
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchPublicJobs();
  }, []);

  // Function to fetch existing application when modal is opened for a job
  const fetchExistingApplication = async (jobId: string) => {
    if (!currentUserId || !auth?.app) return null;
    const db = getFirestore(auth.app);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const applicationsRef = collection(db, `artifacts/${appId}/users/${currentUserId}/applications`);
    const q = query(applicationsRef, where("jobId", "==", jobId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const appData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Application;
      setExistingApplication(appData);
      setCoverLetter(appData.coverLetter || '');
      setElevatorPitchText(appData.elevatorPitchText || '');
      
      // Load existing video info into recordedVideoBlobs for selection
      if (appData.elevatorPitchVideoUrl && appData.elevatorPitchVideoFileName) {
        setRecordedVideoBlobs(prev => {
          if (!prev.some(v => v.id === 'existing')) { // Prevent adding duplicate if already loaded
            return [...prev, { id: 'existing', url: appData.elevatorPitchVideoUrl, fileName: appData.elevatorPitchVideoFileName, blob: new Blob() }];
          }
          return prev;
        });
        setSelectedVideoId('existing'); // Select it for display
      }
      return appData;
    }
    return null;
  };

  const handleApplyClick = async (job: Job) => { // Made async
    if (!currentUser) {
      alert("Please log in to apply for jobs."); // Replace with a nicer toast/modal
      return;
    }
    setSelectedJobToApply(job);
    // Reset form states for new/draft application
    setCoverLetter('');
    setElevatorPitchText('');
    setResumeFile(null);
    setRecordedVideoBlobs([]); // Clear all previous recordings/uploads
    setSelectedVideoId(null);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // Stop any ongoing recording
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

  const handleResumeFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      console.log("Resume file selected:", file.name);
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
          setSelectedVideoId(newVideoId); // Auto-select the new recording
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
      setSelectedVideoId(newVideoId); // Auto-select the new upload
      setApplyError(''); // Clear errors
      console.log("Video file selected:", file.name); 
      event.target.value = ''; // Important for re-uploading same file
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
      setSelectedVideoId(null); // Deselect if removed
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
    if (!selectedJobToApply || !currentUser || !currentUserId || !auth?.app) {
      toast.error("Application data missing or user not authenticated.");
      return;
    }
    
    if (!isDraft && !resumeFile && !existingApplication?.resumeUrl) { // Check for existing URL too
        setApplyError("Please upload your resume for final submission.");
        toast.error("Resume is required for final submission.");
        return;
    }

    setIsApplying(true);
    setApplyError('');

    const db = getFirestore(auth.app);
    if (!db) {
        setApplyError("Database not initialized. Please try again.");
        setIsApplying(false);
        return;
    }

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const applicationsCollectionRef = collection(db, `artifacts/${appId}/users/${currentUserId}/applications`);

    try {
      const applicationStatus: Application['status'] = isDraft ? 'Started Application' : 'Applied';
      const currentTimestamp = new Date().toISOString();

      // --- Handle File Uploads (Simulated Firebase Storage) ---
      let finalResumeUrl = existingApplication?.resumeUrl;
      let finalResumeFileName = existingApplication?.resumeFileName;
      if (resumeFile) {
        finalResumeUrl = `gs://your-storage-bucket/resumes/${currentUserId}_${resumeFile.name}_${Date.now()}`;
        finalResumeFileName = resumeFile.name;
        console.log(`Simulating resume upload to: ${finalResumeUrl}`);
      }

      const selectedVideoBlobInfo = recordedVideoBlobs.find(v => v.id === selectedVideoId);
      let finalVideoPitchUrl = existingApplication?.elevatorPitchVideoUrl;
      let finalVideoPitchFileName = existingApplication?.elevatorPitchVideoFileName;
      if (selectedVideoBlobInfo) {
        finalVideoPitchUrl = `gs://your-storage-bucket/video_pitches/${currentUserId}_${selectedVideoBlobInfo.fileName || Date.now()}.webm`;
        finalVideoPitchFileName = selectedVideoBlobInfo.fileName;
        console.log(`Simulating video pitch upload to: ${finalVideoPitchUrl}`);
      } else if (existingApplication && !selectedVideoId && existingApplication.elevatorPitchVideoUrl) { 
          finalVideoPitchUrl = undefined;
          finalVideoPitchFileName = undefined;
      }


      const applicationData: Application = {
        jobId: selectedJobToApply.id,
        jobTitle: selectedJobToApply.jobTitle,
        companyName: selectedJobToApply.companyName,
        applicantId: currentUserId,
        applicantEmail: currentUser.email || '',
        applicantName: currentUser.displayName || currentUser.email || 'Anonymous',
        resumeUrl: finalResumeUrl || null, // Ensure null instead of undefined
        resumeFileName: finalResumeFileName || null, // Ensure null instead of undefined
        coverLetter: coverLetter || null, // Ensure null instead of undefined
        elevatorPitchText: elevatorPitchText || null, // Ensure null instead of undefined
        elevatorPitchVideoUrl: finalVideoPitchUrl || null, // Ensure null instead of undefined
        elevatorPitchVideoFileName: finalVideoPitchFileName || null, // Ensure null instead of undefined
        status: applicationStatus,
        appliedAt: isDraft ? (existingApplication?.appliedAt || null) : currentTimestamp, // If draft, preserve existing appliedAt or null, else set currentTimestamp
        draftedAt: isDraft ? currentTimestamp : (existingApplication?.draftedAt || null), // If draft, set currentTimestamp, else preserve existing draftedAt or null
        submittedAt: isDraft ? (existingApplication?.submittedAt || null) : currentTimestamp, // If draft, preserve existing submittedAt or null, else set currentTimestamp
      };

      if (existingApplication?.id) {
        const appDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/applications`, existingApplication.id);
        const { id, ...dataToUpdate } = applicationData; // Remove 'id' from data if present for updateDoc
        await updateDoc(appDocRef, dataToUpdate);
        toast.success(`Application ${isDraft ? 'draft saved' : 'submitted'} successfully (updated existing)!`);
      } else {
        const { id, ...dataToAdd } = applicationData; // Remove 'id' from data if present for addDoc
        await addDoc(applicationsCollectionRef, dataToAdd);
        toast.success(`Application ${isDraft ? 'draft saved' : 'submitted'} successfully (new)!`);
      }
      
      setIsApplyModalOpen(false); // Close the modal after submission
    } catch (error: any) {
      setApplyError(error.message || `Failed to ${isDraft ? 'save draft' : 'submit application'}.`);
      console.error(`Error ${isDraft ? 'saving draft' : 'submitting application'}:`, error);
      toast.error(`Failed to ${isDraft ? 'save draft' : 'submit application'}.`);
    } finally {
      setIsApplying(false);
    }
  };


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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Listings</h1>
        <p className="text-sm text-gray-500">Explore open positions matching your skills and preferences</p>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Input 
            type="text" 
            placeholder="Search jobs by title, company, or keyword..." 
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <Select className="w-48">
          <option>All Locations</option>
          <option>Remote</option>
          <option>San Francisco</option>
          <option>New York</option>
        </Select>
        <Button>Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            <BriefcaseBusiness size={40} className="mx-auto mb-4" />
            <p className="text-lg font-medium">No published job listings available at the moment.</p>
            <p className="text-sm mt-2">Check back later or adjust your filters!</p>
          </div>
        ) : (
          jobs.map(job => (
            <Card key={job.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-800">{job.jobTitle}</CardTitle>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Building className="mr-1" size={16} />{job.companyName || 'N/A'}
                </div>
              </CardHeader>
              <CardContent>
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

                <div className="flex items-center justify-between mt-4">
                  {userRole === 'candidate' && (
                    <Button size="sm" onClick={() => handleApplyClick(job)}>
                      <Send size={16} className="mr-1" /> Apply Now
                    </Button>
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

      {/* Apply Job Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 max-h-full overflow-y-auto"> {/* Added max-h-full and overflow-y-auto */}
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold">Apply for {selectedJobToApply?.jobTitle}</DialogTitle>
            <DialogDescription className="text-md text-gray-600">
              Submit your application for this position at {selectedJobToApply?.companyName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 border-t border-b border-gray-200 my-4 flex-grow overflow-y-auto pr-3"> {/* Added flex-grow and overflow-y-auto */}
            {selectedJobToApply?.description && (
                <div className="mb-4">
                    <Label className="font-semibold text-gray-700 mb-2 block">Job Description</Label>
                    <div className="max-h-[150px] overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 text-sm text-gray-700 shadow-inner">
                        <div dangerouslySetInnerHTML={{ __html: selectedJobToApply.description }}></div>
                    </div>
                </div>
            )}
            
            {/* Resume Upload Section */}
            <div>
              <Label htmlFor="resume-upload" className="mb-2 block font-semibold text-gray-700">Upload Your Resume *</Label>
              <Input 
                id="resume-upload" 
                type="file" 
                accept=".pdf,.docx" 
                onChange={handleResumeFileUpload} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isApplying}
              />
              {resumeFile && <p className="text-sm text-gray-600 mt-1">Selected: {resumeFile.name}</p>}
              {existingApplication?.resumeFileName && !resumeFile && (
                <p className="text-sm text-gray-500 mt-1">Currently attached: {existingApplication.resumeFileName} (Re-upload to change)</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOCX</p>
            </div>

            {/* Elevator Pitch Video/Text Section */}
            <div>
              <Label className="mb-2 block font-semibold text-gray-700">Elevator Pitch</Label>
              <div className="bg-black rounded-lg aspect-video mb-2 flex items-center justify-center">
                  {/* Display recorded video or existing video */}
                  {selectedVideoId && recordedVideoBlobs.length > 0 ? (
                      <video 
                          ref={videoRef} 
                          src={recordedVideoBlobs.find(v => v.id === selectedVideoId)?.url} 
                          controls 
                          className="w-full h-full rounded-lg object-contain bg-black"
                      ></video>
                  ) : (
                      <p className="text-gray-500">No video selected or recorded.</p>
                  )}
              </div>
              <div className="flex justify-center items-center gap-4 mb-3">
                  {isRecording ? (
                      <Button onClick={stopRecording} variant="destructive" disabled={isApplying}>
                          <StopCircle size={16} className="mr-2" />Stop Recording
                      </Button>
                  ) : (
                      <Button onClick={startRecording} disabled={isApplying}>
                          <Mic size={16} className="mr-2" />Record Video Pitch
                      </Button>
                  )}
                  <Input 
                      id="video-upload" 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoFileUpload} 
                      className="hidden" // Keep hidden, let label handle click
                      disabled={isApplying}
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer m-0">
                      <Button as="span" variant="outline" disabled={isApplying}>
                          <UploadCloud size={16} className="mr-2" />Upload Video File
                      </Button>
                  </Label>
              </div>
              {recordedVideoBlobs.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-24 overflow-y-auto border p-2 rounded-md bg-gray-50">
                      {recordedVideoBlobs.map(video => (
                          <div 
                              key={video.id} 
                              className={cn(
                                  "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100",
                                  selectedVideoId === video.id ? "bg-blue-50 border border-blue-200" : ""
                              )}
                              onClick={() => handleSelectVideo(video.id)}
                          >
                              <span className="text-sm font-medium flex items-center">
                                  <PlayCircle size={16} className="mr-2 text-blue-500" />
                                  {video.fileName}
                              </span>
                              <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-auto p-1 text-red-500 hover:bg-red-50"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveVideo(video.id); }}
                                  disabled={isApplying}
                              >
                                  <XCircle size={16} />
                              </Button>
                          </div>
                      ))}
                  </div>
              )}
              <Textarea
                id="elevator-pitch-text"
                rows={4}
                value={elevatorPitchText}
                onChange={(e) => setElevatorPitchText(e.target.value)}
                placeholder="Alternatively, type your elevator pitch (max 150 words)..."
                maxLength={150 * 5}
                disabled={isApplying}
              />
              <p className="text-xs text-gray-500 text-right mt-1">{elevatorPitchText.split(/\s+/).filter(Boolean).length} words</p>
            </div>

            {/* Cover Letter Field */}
            <div>
              <Label htmlFor="cover-letter" className="mb-2 block font-semibold text-gray-700">Cover Letter (Optional)</Label>
              <Textarea 
                id="cover-letter" 
                rows={5} 
                value={coverLetter} 
                onChange={(e) => setCoverLetter(e.target.value)} 
                placeholder="Write a brief cover letter..."
                disabled={isApplying}
              />
            </div>

            {applyError && <p className="text-red-500 text-sm">{applyError}</p>}
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


      {/* Floating Button */}
      <FloatingButton />
    </Layout>
  );
};

export default Jobs;
