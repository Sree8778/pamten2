import React from 'react';
import { User, Calendar, Check, Plus, Mail, Phone, MapPin, BriefcaseBusiness, GraduationCap } from 'lucide-react'; // FIXED: Imported directly from lucide-react
import { Button } from '@/components/ui/button'; // Using alias
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components

// Define CandidateProfile interface (matching the one in Candidates.tsx)
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

interface CandidateProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string; // From userProfile directly (might be summary)
  experience?: string; // From userProfile directly (might be summary)
  education?: string; // From userProfile directly (might be summary)
  currentRole?: string; // From userProfile directly
  parsedResumeContent?: ParsedResumeData; // Detailed parsed data from resume
}

interface ProfileHeaderProps {
  candidate: CandidateProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ candidate }) => {
  // Prioritize parsed resume data, fall back to user profile data
  const candidateName = candidate.parsedResumeContent?.personal?.name || candidate.name || 'N/A';
  const candidateEmail = candidate.parsedResumeContent?.personal?.email || candidate.email || 'N/A';
  const candidatePhone = candidate.parsedResumeContent?.personal?.phone || candidate.phone || 'N/A';
  const candidateLocation = candidate.parsedResumeContent?.personal?.location || candidate.location || 'N/A';
  
  // Get current role and company from the first experience entry if available
  const candidateCurrentRole = candidate.parsedResumeContent?.experience?.[0]?.jobTitle || candidate.currentRole || 'N/A';
  const candidateCompany = candidate.parsedResumeContent?.experience?.[0]?.company || 'N/A';

  // Get skills from parsed data, join if it's an array, otherwise use string from profile
  const candidateSkills = (candidate.parsedResumeContent?.skills && Array.isArray(candidate.parsedResumeContent.skills) && candidate.parsedResumeContent.skills.length > 0)
    ? candidate.parsedResumeContent.skills.map(s => s.skills_list).filter(Boolean).join(', ')
    : candidate.skills || 'N/A';

  // Get education from parsed data, use first entry's degree, otherwise use string from profile
  const candidateEducation = (candidate.parsedResumeContent?.education && Array.isArray(candidate.parsedResumeContent.education) && candidate.parsedResumeContent.education.length > 0)
    ? candidate.parsedResumeContent.education[0].degree
    : candidate.education || 'N/A';


  // Mock data for match score and status (these would typically come from a matching algorithm or application status)
  const matchScore = 95; // Placeholder
  const currentStatus = "New Lead"; // Placeholder

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        {/* Avatar */}
        <Avatar className="w-16 h-16 flex-shrink-0">
          <AvatarImage src={`https://placehold.co/64x64/E0E0E0/888888?text=${candidateName.charAt(0)}`} alt={candidateName} />
          <AvatarFallback>{candidateName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            {/* Name and Role */}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{candidateName}</h1>
              <p className="text-sm text-gray-600">
                {candidateCurrentRole !== 'N/A' && `${candidateCurrentRole}`}
                {candidateCurrentRole !== 'N/A' && candidateCompany !== 'N/A' && ` at ${candidateCompany}`}
                {candidateCurrentRole === 'N/A' && candidateCompany === 'N/A' && 'Role not specified'}
              </p>
            </div>

            {/* Match Score and Status Dropdown */}
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 rounded bg-gray-800 text-white text-sm font-medium">
                Match: {matchScore}%
              </div>
              <select className="border border-gray-200 rounded px-2 py-1 text-sm">
                <option>New Lead</option>
                <option>Screening</option>
                <option>Interview</option>
                <option>Offer</option>
              </select>
            </div>
          </div>

          {/* Contact and Basic Info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {candidateEmail !== 'N/A' && (
              <div className="flex items-center">
                <Mail size={16} className="mr-1 text-gray-400" />
                <span>{candidateEmail}</span>
              </div>
            )}
            {candidatePhone !== 'N/A' && (
              <div className="flex items-center">
                <Phone size={16} className="mr-1 text-gray-400" />
                <span>{candidatePhone}</span>
              </div>
            )}
            {candidateLocation !== 'N/A' && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1 text-gray-400" />
                <span>{candidateLocation}</span>
              </div>
            )}
            {candidateSkills !== 'N/A' && (
              <div className="flex items-center">
                <BriefcaseBusiness size={16} className="mr-1 text-gray-400" />
                <span className="line-clamp-1">Skills: {candidateSkills}</span>
              </div>
            )}
            {candidateEducation !== 'N/A' && (
              <div className="flex items-center">
                <GraduationCap size={16} className="mr-1 text-gray-400" />
                <span className="line-clamp-1">Education: {candidateEducation}</span>
              </div>
            )}
            {/* Add other relevant info like years of experience, open to relocation etc. from parsed data if available */}
            {/* Example static data, replace with dynamic if available in parsedResumeContent */}
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-gray-400" />
              <span>5 years experience (Mock)</span>
            </div>
            {/* Relocation status from parsed data or user profile */}
            {candidate.parsedResumeContent?.personal?.legalStatus && (
                <div className="flex items-center">
                  <Check size={16} className="mr-1 text-gray-400" />
                  <span>Legal Status: {candidate.parsedResumeContent.personal.legalStatus}</span>
                </div>
            )}
            {/* Mock for open to relocation, replace with actual data if available */}
            <div className="flex items-center">
              <Check size={16} className="mr-1 text-gray-400" />
              <span>Open to relocation (Mock)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-6">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Calendar size={16} /> Schedule Interview
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Check size={16} /> Request Background Check
        </Button>
        <Button size="sm" className="flex items-center gap-1 bg-gray-800">
          <Plus size={16} /> Send Offer
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
