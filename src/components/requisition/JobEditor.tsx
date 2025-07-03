import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Sparkles, Loader2, Lightbulb, CheckCircle2, Copy, CalendarIcon } from 'lucide-react'; // Import CalendarIcon
import { toast } from 'sonner';

import { getFirebaseAuth, getCurrentUserId, addJob, updateJob, deleteJob } from '@/lib/firebase';
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// For Date Picker
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar'; // Import the Calendar component
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { cn } from '@/lib/utils'; // Import cn for conditional classNames


interface Job {
  id?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  department: string;
  description: string;
  status: 'Draft' | 'Published';
  postedAt?: string;
  recruiterId?: string;
  salary?: string;
  skills?: string;
  deadline?: string; // NEW: Added deadline to Job interface (ISO string)
}

interface JobEditorProps {
  job: Job | null;
  onSave: (jobSaved: boolean, newJobId?: string) => void;
  onCancel: () => void;
}

const editorModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link'],
        ['clean']
    ]
};

const JobEditor = ({ job, onSave, onCancel }: JobEditorProps) => {
  const [jobTitle, setJobTitle] = useState(job?.jobTitle || '');
  const [companyName, setCompanyName] = useState(job?.companyName || '');
  const [location, setLocation] = useState(job?.location || '');
  const [department, setDepartment] = useState(job?.department || '');
  const [description, setDescription] = useState(job?.description || '');
  const [salary, setSalary] = useState(job?.salary || '');
  const [skills, setSkills] = useState(job?.skills || '');
  const [deadline, setDeadline] = useState<Date | undefined>(
    job?.deadline ? new Date(job.deadline) : undefined // NEW: State for deadline
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const auth = getFirebaseAuth();
  const currentFirebaseUser = auth?.currentUser;
  const recruiterId = currentFirebaseUser ? getCurrentUserId(currentFirebaseUser) : '';

  useEffect(() => {
    if (job) {
      setJobTitle(job.jobTitle);
      setCompanyName(job.companyName || '');
      setLocation(job.location);
      setDepartment(job.department || '');
      setDescription(job.description);
      setSalary(job.salary || '');
      setSkills(job.skills || '');
      setDeadline(job.deadline ? new Date(job.deadline) : undefined); // Set deadline when editing
    } else {
      setJobTitle('');
      setCompanyName('');
      setLocation('');
      setDepartment('');
      setDescription('');
      setSalary('');
      setSkills('');
      setDeadline(undefined); // Clear deadline for new job
    }
    setError('');
    setAiSuggestions([]);
  }, [job]);

  const handleGenerateAISuggestions = async () => {
    if (!description.trim()) {
      toast.info("Please write some job description text to get suggestions.");
      return;
    }
    setLoadingSuggestions(true);
    setError('');
    setAiSuggestions([]);
    toast.loading("Generating AI suggestions...", { id: 'ai-suggest' });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const mockSuggestions = [
        "We are seeking a highly motivated and experienced **Senior Product Designer** to lead UX/UI initiatives for our next-generation consumer applications.",
        "Design and develop intuitive, user-centered interfaces, collaborating closely with cross-functional engineering and product teams.",
        "Proven ability to translate complex user needs into elegant design solutions, with expertise in wireframing, prototyping, and user testing."
      ];
      setAiSuggestions(mockSuggestions);
      toast.success("AI suggestions generated!", { id: 'ai-suggest' });

    } catch (err: any) {
      console.error("JobEditor: AI suggestion error:", err);
      toast.error("Failed to get AI suggestions.", { id: 'ai-suggest' });
      setError("Failed to get AI suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    setDescription(suggestion);
    toast.success("AI suggestion applied!");
  };

  const handleSaveJob = async (publish: boolean = false) => {
    if (!recruiterId) {
      setError("User not authenticated. Cannot save job.");
      toast.error("Authentication required to save job.");
      return;
    }
    if (!jobTitle.trim() || !location.trim() || !description.trim()) {
      setError("Job Title, Location, and Description are required.");
      toast.error("Job Title, Location, and Description are required.");
      return;
    }

    setLoading(true);
    setError('');

    const currentStatus: 'Draft' | 'Published' = publish ? 'Published' : 'Draft'; 

    const jobData: Job = {
      jobTitle,
      companyName,
      location,
      department,
      description,
      status: currentStatus,
      recruiterId: recruiterId,
      salary,
      skills,
      deadline: deadline ? deadline.toISOString() : undefined, // NEW: Include deadline as ISO string
    };

    try {
      let savedJobResult = null;
      if (job?.id) {
        savedJobResult = await updateJob(job.id, jobData, job, recruiterId); 
        toast.success(`Job "${savedJobResult.jobTitle}" updated successfully!`);
      } else {
        savedJobResult = await addJob(jobData, currentStatus === 'Published' ? undefined : recruiterId);
        toast.success(`Job "${savedJobResult.jobTitle}" created successfully!`);
      }
      onSave(true, savedJobResult?.id);
    } catch (err: any) {
      console.error("JobEditor: Error caught in handleSaveJob:", err);
      if (err.message && err.message.includes("Missing or insufficient permissions")) {
        setError("Permission denied. You may not have the required role or ownership to perform this action.");
        toast.error("Permission denied to save job. Check console for details.");
      } else {
        setError(err.message || "Failed to save job due to an unexpected error.");
        toast.error("Failed to save job. Check console for details.");
      }
      onSave(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-md font-bold text-gray-800">
          {job ? `Job Requisition: ${job.jobTitle}` : 'New Job Requisition'}
        </CardTitle>
        <div className="flex items-center space-x-4">
          {job && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{job.status}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-5">
          {error && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle" className="label mb-1 block font-semibold text-gray-700">JOB TITLE</Label>
              <Input 
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Product Designer"
                disabled={loading}
                className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            <div>
              <Label htmlFor="companyName" className="label mb-1 block font-semibold text-gray-700">COMPANY NAME</Label>
              <Input 
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Tech Solutions Inc."
                disabled={loading}
                className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="jobDescription" className="label mb-1 block font-semibold text-gray-700">JOB DESCRIPTION</Label>
            <div className="bg-white rounded-md border border-gray-300">
              <ReactQuill 
                  id="jobDescription"
                  theme="snow" 
                  value={description} 
                  onChange={setDescription} 
                  modules={editorModules} 
                  placeholder="Detailed description of the job, responsibilities, and qualifications..."
                  readOnly={loading || loadingSuggestions}
                  className="rounded-md"
              />
            </div>
            <Button 
              onClick={handleGenerateAISuggestions} 
              disabled={loading || loadingSuggestions}
              className="mt-3 bg-indigo-500 hover:bg-indigo-600 text-white flex items-center shadow-md transition-all duration-200"
            >
              {loadingSuggestions ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles size={18} className="mr-2" />}
              Generate AI Suggestions
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="label mb-1 block font-semibold text-gray-700">LOCATION</Label>
              <Input 
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA (Remote OK)"
                disabled={loading}
                className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            <div>
              <Label htmlFor="department" className="label mb-1 block font-semibold text-gray-700">DEPARTMENT</Label>
              <Input 
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Product Development"
                disabled={loading}
                className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary" className="label mb-1 block font-semibold text-gray-700">SALARY</Label>
              <Input 
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g., $80,000 - $100,000"
                disabled={loading}
                className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
            <div>
              <Label htmlFor="skills" className="label mb-1 block font-semibold text-gray-700">SKILLS</Label>
              <Textarea 
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, AWS, UX/UI Design"
                disabled={loading}
                className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400 min-h-[60px]"
              />
            </div>
          </div>

          {/* NEW: Application Deadline Field */}
          <div>
            <Label htmlFor="deadline" className="label mb-1 block font-semibold text-gray-700">APPLICATION DEADLINE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border border-gray-300 rounded-md focus:ring-blue-400 focus:border-blue-400",
                    !deadline && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md border border-gray-200">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

        </div>
        
        <div className="border-l border-gray-200 pl-4 md:col-span-1 bg-gray-50 p-5 rounded-lg shadow-sm flex flex-col items-center">
          <Lightbulb size={36} className="text-yellow-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-3">AI Suggestions</h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Get AI-powered ideas to refine your job description.
          </p>
          
          {aiSuggestions.length > 0 ? (
            <div className="w-full space-y-3 overflow-y-auto max-h-[300px]">
              {aiSuggestions.map((sug, index) => (
                <div key={index} className="bg-white p-3 rounded-md border border-gray-300 shadow-sm flex items-start text-sm text-gray-800">
                  <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div dangerouslySetInnerHTML={{ __html: sug }} className="flex-grow"></div>
                  <Button variant="ghost" size="sm" onClick={() => handleApplySuggestion(sug)} className="ml-2 flex-shrink-0 p-1 h-auto text-blue-600 hover:bg-blue-50">
                    <Copy size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center text-sm">
              No suggestions yet. Write some description and click "Generate AI Suggestions".
            </div>
          )}
        </div>
      </CardContent>

      <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200 p-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={() => handleSaveJob(false)} disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
          {loading ? "Saving..." : "Save Draft"}
        </Button>
        <Button onClick={() => handleSaveJob(true)} disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
          {loading ? "Publishing..." : "Publish Job"}
        </Button>
      </DialogFooter>
    </Card>
  );
};

export default JobEditor;
