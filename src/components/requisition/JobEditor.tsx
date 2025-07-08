import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Sparkles, Loader2, Lightbulb, CheckCircle2, Copy, CalendarIcon, X,
  ChevronDown, ChevronUp, BriefcaseBusiness, DollarSign, ListChecks, Users, Globe, Building, MapPin,
  Upload, Eye // Added Upload and Eye for company branding/preview
} from 'lucide-react';
import { toast } from 'sonner';

import { getFirebaseAuth, getCurrentUserId, addJob, updateJob, uploadFileToStorage } from '@/lib/firebase'; // Added uploadFileToStorage
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'; // Import Collapsible components
import { Slider } from '@/components/ui/slider'; // Import Slider
import { Switch } from '@/components/ui/switch'; // Import Switch

// For Date Picker
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';


// Define Job interface with new fields
interface Job {
  id?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  department?: string;
  description: string;
  status: 'Draft' | 'Published';
  postedAt?: string;
  recruiterId?: string;
  salaryMin?: number; // Changed to number
  salaryMax?: number; // Changed to number
  skills?: string[];
  deadline?: string;
  relocationAssistance?: boolean;
  workArrangement?: 'On-site' | 'Hybrid' | 'Remote (Country)' | 'Remote (Global)' | '';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | ''; // NEW
  experienceLevel?: 'Entry-Level' | 'Associate' | 'Mid-Level' | 'Senior' | 'Lead' | 'Manager' | 'Executive' | ''; // NEW
  resumeUploadRequired?: boolean; // NEW
  customScreeningQuestions?: string[]; // NEW
  maxApplicantsLimit?: 'Unlimited' | '50' | '100' | '200' | ''; // NEW
  companyLogoUrl?: string; // NEW
  aboutCompany?: string; // NEW
  companyWebsiteUrl?: string; // NEW
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
  const [salaryMin, setSalaryMin] = useState(job?.salaryMin || 60000); // Default min salary
  const [salaryMax, setSalaryMax] = useState(job?.salaryMax || 120000); // Default max salary
  const [skills, setSkills] = useState<string[]>(job?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(
    job?.deadline ? new Date(job.deadline) : undefined
  );
  const [relocationAssistance, setRelocationAssistance] = useState(job?.relocationAssistance || false);
  const [workArrangement, setWorkArrangement] = useState<Job['workArrangement']>(job?.workArrangement || '');
  const [employmentType, setEmploymentType] = useState<Job['employmentType']>(job?.employmentType || ''); // NEW state
  const [experienceLevel, setExperienceLevel] = useState<Job['experienceLevel']>(job?.experienceLevel || ''); // NEW state
  const [resumeUploadRequired, setResumeUploadRequired] = useState(job?.resumeUploadRequired ?? true); // NEW state, default true
  const [customScreeningQuestions, setCustomScreeningQuestions] = useState<string[]>(job?.customScreeningQuestions || []); // NEW state
  const [newQuestionInput, setNewQuestionInput] = useState(''); // State for new question input
  const [maxApplicantsLimit, setMaxApplicantsLimit] = useState<Job['maxApplicantsLimit']>(job?.maxApplicantsLimit || 'Unlimited'); // NEW state
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null); // NEW state for logo file
  const [companyLogoUrl, setCompanyLogoUrl] = useState(job?.companyLogoUrl || ''); // NEW state for logo URL
  const [aboutCompany, setAboutCompany] = useState(job?.aboutCompany || ''); // NEW state
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState(job?.companyWebsiteUrl || ''); // NEW state

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Collapsible states
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [jobDescOpen, setJobDescOpen] = useState(true);
  const [appPrefsOpen, setAppPrefsOpen] = useState(true);
  const [companyBrandingOpen, setCompanyBrandingOpen] = useState(true);


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
      setSalaryMin(job.salaryMin || 60000);
      setSalaryMax(job.salaryMax || 120000);
      setSkills(job.skills || []);
      setDeadline(job.deadline ? new Date(job.deadline) : undefined);
      setRelocationAssistance(job.relocationAssistance || false);
      setWorkArrangement(job.workArrangement || '');
      setEmploymentType(job.employmentType || '');
      setExperienceLevel(job.experienceLevel || '');
      setResumeUploadRequired(job.resumeUploadRequired ?? true);
      setCustomScreeningQuestions(job.customScreeningQuestions || []);
      setMaxApplicantsLimit(job.maxApplicantsLimit || 'Unlimited');
      setCompanyLogoUrl(job.companyLogoUrl || '');
      setAboutCompany(job.aboutCompany || '');
      setCompanyWebsiteUrl(job.companyWebsiteUrl || '');
    } else {
      setJobTitle('');
      setCompanyName('');
      setLocation('');
      setDepartment('');
      setDescription('');
      setSalaryMin(60000);
      setSalaryMax(120000);
      setSkills([]);
      setNewSkillInput('');
      setDeadline(undefined);
      setRelocationAssistance(false);
      setWorkArrangement('');
      setEmploymentType('');
      setExperienceLevel('');
      setResumeUploadRequired(true);
      setCustomScreeningQuestions([]);
      setNewQuestionInput('');
      setMaxApplicantsLimit('Unlimited');
      setCompanyLogoFile(null);
      setCompanyLogoUrl('');
      setAboutCompany('');
      setCompanyWebsiteUrl('');
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

  const handleAddSkill = () => {
    const skillToAdd = newSkillInput.trim();
    if (skillToAdd && !skills.includes(skillToAdd)) {
      setSkills(prevSkills => [...prevSkills, skillToAdd]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prevSkills => prevSkills.filter(skill => skill !== skillToRemove));
  };

  // NEW: Handle adding a custom screening question
  const handleAddQuestion = () => {
    const questionToAdd = newQuestionInput.trim();
    if (questionToAdd && !customScreeningQuestions.includes(questionToAdd)) {
      setCustomScreeningQuestions(prevQuestions => [...prevQuestions, questionToAdd]);
      setNewQuestionInput('');
    }
  };

  // NEW: Handle removing a custom screening question
  const handleRemoveQuestion = (questionToRemove: string) => {
    setCustomScreeningQuestions(prevQuestions => prevQuestions.filter(q => q !== questionToRemove));
  };

  // NEW: Handle company logo file upload
  const handleCompanyLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyLogoFile(file);
      // Optionally, show a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogoUrl(reader.result as string); // Set as temporary URL for preview
      };
      reader.readAsDataURL(file);
    }
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
    if (!companyName.trim()) {
        setError("Company Name is required.");
        toast.error("Company Name is required.");
        return;
    }

    setLoading(true);
    setError('');

    let finalCompanyLogoUrl = companyLogoUrl;
    if (companyLogoFile) {
        try {
            const logoPath = `company_logos/${recruiterId}/${companyLogoFile.name}`;
            finalCompanyLogoUrl = await uploadFileToStorage(companyLogoFile, logoPath);
            toast.success("Company logo uploaded successfully!");
        } catch (logoError: any) {
            console.error("JobEditor: Error uploading company logo:", logoError);
            toast.error("Failed to upload company logo.");
            // Continue saving job data even if logo upload fails
        }
    }

    const currentStatus: 'Draft' | 'Published' = publish ? 'Published' : 'Draft';

    const jobData: Job = {
      jobTitle,
      companyName,
      location,
      department,
      description,
      status: currentStatus,
      recruiterId: recruiterId,
      salaryMin, // NEW
      salaryMax, // NEW
      skills,
      deadline: deadline ? deadline.toISOString() : undefined,
      relocationAssistance,
      workArrangement,
      employmentType, // NEW
      experienceLevel, // NEW
      resumeUploadRequired, // NEW
      customScreeningQuestions, // NEW
      maxApplicantsLimit, // NEW
      companyLogoUrl: finalCompanyLogoUrl, // NEW
      aboutCompany, // NEW
      companyWebsiteUrl, // NEW
    };

    try {
      let savedJobResult = null;
      if (job?.id) {
        savedJobResult = await updateJob(job.id, jobData);
        toast.success(`Job "${savedJobResult.jobTitle}" updated successfully!`);
      } else {
        savedJobResult = await addJob(jobData);
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

  // Helper for AI Summary
  const formatSalary = (min?: number, max?: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `From $${min.toLocaleString()}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()}`;
    }
    return 'Not specified';
  };

  return (
    <Card className="border border-gray-200 shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {job ? `Edit Job Posting` : 'Create New Job Posting'}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled={loading}>Save as Template</Button>
          <Button variant="outline" size="sm" disabled={loading}>Use Previous Job</Button>
          <Button variant="secondary" size="sm" disabled={loading}>
            <Eye size={16} className="mr-2" /> Preview Job
          </Button>
          <Button onClick={() => handleSaveJob(false)} disabled={loading} size="sm">
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Save Draft
          </Button>
          <Button onClick={() => handleSaveJob(true)} disabled={loading} size="sm" className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Post Job
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {error && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">{error}</div>}

          {/* Basic Job Information Section */}
          <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen} className="border rounded-lg shadow-sm">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-lg bg-gray-50 rounded-t-lg">
              Basic Job Information
              {basicInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4">
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
                  <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">AI Suggestions</Button>
                </div>
                <div>
                  <Label htmlFor="department" className="label mb-1 block font-semibold text-gray-700">DEPARTMENT</Label>
                  <Select onValueChange={setDepartment} value={department} disabled={loading}>
                    <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="label mb-1 block font-semibold text-gray-700">LOCATION</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    disabled={loading}
                    className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6 md:mt-0"> {/* Adjusted margin for alignment */}
                  <Checkbox
                    id="relocationAssistance"
                    checked={relocationAssistance}
                    onCheckedChange={(checked) => setRelocationAssistance(!!checked)}
                    disabled={loading}
                  />
                  <Label htmlFor="relocationAssistance" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Relocation Assistance Offered
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employmentType" className="label mb-1 block font-semibold text-gray-700">EMPLOYMENT TYPE</Label>
                  <Select onValueChange={setEmploymentType} value={employmentType} disabled={loading}>
                    <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workArrangement" className="label mb-1 block font-semibold text-gray-700">WORK ARRANGEMENT</Label>
                  <Select onValueChange={setWorkArrangement} value={workArrangement} disabled={loading}>
                    <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400">
                      <SelectValue placeholder="Select Work Arrangement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Remote (Country)">Remote (Country-specific)</SelectItem>
                      <SelectItem value="Remote (Global)">Remote (Global)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Job Description & Requirements Section */}
          <Collapsible open={jobDescOpen} onOpenChange={setJobDescOpen} className="border rounded-lg shadow-sm">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-lg bg-gray-50 rounded-t-lg">
              Job Description & Requirements
              {jobDescOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="jobDescription" className="label mb-1 block font-semibold text-gray-700">JOB DESCRIPTION</Label>
                <div className="bg-white rounded-md border border-gray-300">
                  <ReactQuill
                      id="jobDescription"
                      theme="snow"
                      value={description}
                      onChange={setDescription}
                      modules={editorModules}
                      placeholder="Describe the role, responsibilities, and company culture..."
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
                  Suggest description with AI
                </Button>
              </div>

              {/* Skills input as tags */}
              <div>
                <Label htmlFor="skills" className="label mb-1 block font-semibold text-gray-700">REQUIRED SKILLS</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[38px] border border-gray-300 rounded-md p-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0.5"
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={loading}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    id="newSkill"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder={skills.length === 0 ? "Add a skill (e.g., React, AWS)" : ""}
                    disabled={loading}
                    className="flex-grow border-none focus-visible:ring-0 shadow-none p-0 h-auto"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={loading || !newSkillInput.trim()}
                  className="mt-2 text-xs py-1 px-2 h-auto"
                >
                  Add Skill
                </Button>
              </div>

              {/* Years of Experience Slider */}
              <div>
                <Label htmlFor="experienceLevel" className="label mb-1 block font-semibold text-gray-700">YEARS OF EXPERIENCE</Label>
                <Select onValueChange={setExperienceLevel} value={experienceLevel} disabled={loading}>
                  <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400">
                    <SelectValue placeholder="Select Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                    <SelectItem value="Associate">Associate</SelectItem>
                    <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range Slider */}
              <div>
                <Label htmlFor="salaryRange" className="label mb-1 block font-semibold text-gray-700">SALARY RANGE (ANNUAL)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    placeholder="Min"
                    className="w-1/2"
                    disabled={loading}
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    placeholder="Max"
                    className="w-1/2"
                    disabled={loading}
                  />
                </div>
                {/* Could add a Slider component here if desired, connecting to min/max values */}
                {/* Example: <Slider min={0} max={200000} step={1000} value={[salaryMin, salaryMax]} onValueChange={([min, max]) => { setSalaryMin(min); setSalaryMax(max); }} /> */}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Application Preferences Section */}
          <Collapsible open={appPrefsOpen} onOpenChange={setAppPrefsOpen} className="border rounded-lg shadow-sm">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-lg bg-gray-50 rounded-t-lg">
              Application Preferences
              {appPrefsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4">
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

              {/* Resume Upload Required Toggle */}
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="resumeUploadRequired" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Resume Upload Required
                </Label>
                <Switch
                  id="resumeUploadRequired"
                  checked={resumeUploadRequired}
                  onCheckedChange={setResumeUploadRequired}
                  disabled={loading}
                />
              </div>

              {/* Custom Screening Questions */}
              <div>
                <Label htmlFor="customQuestions" className="label mb-1 block font-semibold text-gray-700">CUSTOM SCREENING QUESTIONS</Label>
                <div className="space-y-2">
                  {customScreeningQuestions.map((question, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md border border-gray-200">
                      <span className="text-sm text-gray-700">{question}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0.5 text-red-500 hover:bg-red-100"
                        onClick={() => handleRemoveQuestion(question)}
                        disabled={loading}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                  <Input
                    id="newQuestion"
                    value={newQuestionInput}
                    onChange={(e) => setNewQuestionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuestion();
                      }
                    }}
                    placeholder="Add a custom question"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    disabled={loading || !newQuestionInput.trim()}
                    className="mt-2 text-xs py-1 px-2 h-auto"
                  >
                    Add Custom Question
                  </Button>
                </div>
              </div>

              {/* Max Applicants Limit */}
              <div>
                <Label htmlFor="maxApplicantsLimit" className="label mb-1 block font-semibold text-gray-700">MAX APPLICANTS LIMIT</Label>
                <Select onValueChange={setMaxApplicantsLimit} value={maxApplicantsLimit} disabled={loading}>
                  <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400">
                    <SelectValue placeholder="Unlimited" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unlimited">Unlimited</SelectItem>
                    <SelectItem value="50">50 Applicants</SelectItem>
                    <SelectItem value="100">100 Applicants</SelectItem>
                    <SelectItem value="200">200 Applicants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Company Branding Section */}
          <Collapsible open={companyBrandingOpen} onOpenChange={setCompanyBrandingOpen} className="border rounded-lg shadow-sm">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-semibold text-lg bg-gray-50 rounded-t-lg">
              Company Branding
              {companyBrandingOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 space-y-4">
              {/* Company Logo Upload */}
              <div>
                <Label htmlFor="companyLogo" className="label mb-1 block font-semibold text-gray-700">COMPANY LOGO UPLOAD</Label>
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleCompanyLogoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={loading}
                />
                {companyLogoUrl && (
                  <div className="mt-2">
                    <img src={companyLogoUrl} alt="Company Logo Preview" className="max-w-[100px] max-h-[100px] object-contain border rounded-md p-1" />
                  </div>
                )}
              </div>

              {/* Company Name (already a Select, but here for context) */}
              <div>
                <Label htmlFor="companyName" className="label mb-1 block font-semibold text-gray-700">COMPANY NAME</Label>
                <Select onValueChange={setCompanyName} value={companyName} disabled={loading}>
                  <SelectTrigger className="w-full rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400">
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PamTen">PamTen</SelectItem>
                    <SelectItem value="SRV">SRV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* About Company */}
              <div>
                <Label htmlFor="aboutCompany" className="label mb-1 block font-semibold text-gray-700">ABOUT COMPANY</Label>
                <Textarea
                  id="aboutCompany"
                  value={aboutCompany}
                  onChange={(e) => setAboutCompany(e.target.value)}
                  placeholder="Describe your company's mission, values, and culture..."
                  rows={4}
                  disabled={loading}
                  className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>

              {/* Company Website URL */}
              <div>
                <Label htmlFor="companyWebsiteUrl" className="label mb-1 block font-semibold text-gray-700">COMPANY WEBSITE URL</Label>
                <Input
                  id="companyWebsiteUrl"
                  type="url"
                  value={companyWebsiteUrl}
                  onChange={(e) => setCompanyWebsiteUrl(e.target.value)}
                  placeholder="https://www.yourcompany.com"
                  disabled={loading}
                  className="rounded-md border border-gray-300 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* AI Job Summary Sidebar */}
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4"> {/* h-fit and sticky for sidebar */}
          <div className="flex items-center mb-4">
            <Lightbulb size={28} className="text-yellow-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">AI Job Summary</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">Real-time preview of your job posting.</p>

          <div className="space-y-4">
            <Card className="p-4 bg-white border border-gray-200 shadow-sm">
              <CardTitle className="text-md font-bold mb-2">{jobTitle || 'New Job Opportunity'}</CardTitle>
              <CardDescription className="text-sm text-gray-600 flex items-center gap-2">
                {companyName && <><Building size={14} /> {companyName}</>}
                {location && <><MapPin size={14} /> {location}</>}
              </CardDescription>
              {workArrangement && (
                <p className="text-sm text-gray-700 mt-2 flex items-center gap-1">
                  <BriefcaseBusiness size={14} /> {workArrangement}
                </p>
              )}
            </Card>

            <div className="space-y-3">
              <h4 className="text-md font-semibold text-gray-700">Key Details</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <ListChecks size={16} className="mr-2 flex-shrink-0 text-gray-500 mt-0.5" />
                  <div>
                    <span className="font-medium">Required Skills:</span>{' '}
                    {skills.length > 0 ? skills.join(', ') : 'None specified'}
                  </div>
                </li>
                <li className="flex items-center">
                  <DollarSign size={16} className="mr-2 text-gray-500" />
                  <span className="font-medium">Salary:</span> {formatSalary(salaryMin, salaryMax)}
                </li>
                {experienceLevel && (
                  <li className="flex items-center">
                    <BriefcaseBusiness size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium">Experience Level:</span> {experienceLevel}
                  </li>
                )}
                {employmentType && (
                  <li className="flex items-center">
                    <BriefcaseBusiness size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium">Employment Type:</span> {employmentType}
                  </li>
                )}
                {relocationAssistance && (
                  <li className="flex items-center">
                    <Globe size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium">Relocation:</span> Offered
                  </li>
                )}
                {resumeUploadRequired !== undefined && (
                  <li className="flex items-center">
                    <Upload size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium">Resume Upload:</span> {resumeUploadRequired ? 'Required' : 'Optional'}
                  </li>
                )}
                 {customScreeningQuestions.length > 0 && (
                  <li className="flex items-start">
                    <Users size={16} className="mr-2 flex-shrink-0 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Screening Questions:</span>{' '}
                      {customScreeningQuestions.length} custom question(s)
                    </div>
                  </li>
                )}
                {maxApplicantsLimit && maxApplicantsLimit !== 'Unlimited' && (
                  <li className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium">Applicant Limit:</span> {maxApplicantsLimit}
                  </li>
                )}
              </ul>
            </div>

            <Button variant="outline" className="w-full mt-4">View Full Posting</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobEditor;
