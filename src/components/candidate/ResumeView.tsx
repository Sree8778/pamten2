import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Using alias

// Define ParsedResumeData interface (matching the one in Candidates.tsx and ProfileHeader.tsx)
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

// Define CandidateProfile interface (matching the one in Candidates.tsx and ProfileHeader.tsx)
interface CandidateProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  currentRole?: string;
  parsedResumeContent?: ParsedResumeData;
}

interface ResumeViewProps {
  candidate: CandidateProfile;
}

const ResumeView: React.FC<ResumeViewProps> = ({ candidate }) => {
  const resumeContent = candidate.parsedResumeContent;

  if (!resumeContent) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-md font-bold text-gray-800">Profile Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center text-gray-500">
          No resume content available for this candidate.
        </CardContent>
      </Card>
    );
  }

  const { personal, summary, experience, education, skills, projects, publications, certifications } = resumeContent;

  return (
    <Card className="border border-gray-200 h-full">
      <CardHeader>
        <CardTitle className="text-md font-bold text-gray-800">Profile Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Summary Section */}
        {summary && summary.trim() && (
          <div>
            <h3 className="text-sm font-medium mb-2">About</h3>
            <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: summary }}></p>
          </div>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && experience.some(exp => exp.jobTitle?.trim()) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Experience</h3>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-300 pl-4 pb-4 relative">
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-0"></div>
                  <div className="text-sm font-medium">{exp.jobTitle}</div>
                  <div className="text-xs text-gray-500">{exp.company} • {exp.dates}</div>
                  {exp.description && exp.description.trim() && (
                    <div className="mt-2 text-xs text-gray-600 list-disc pl-4 space-y-1" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && skills.some(skill => skill.skills_list?.trim()) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {skill.category ? `${skill.category}: ` : ''}
                  <span dangerouslySetInnerHTML={{ __html: skill.skills_list || '' }}></span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {education && education.length > 0 && education.some(edu => edu.degree?.trim()) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Education</h3>
            {education.map((edu, index) => (
              <div key={index} className="text-sm">
                <div>{edu.degree}, {edu.institution}</div>
                <div className="text-xs text-gray-500">{edu.graduationYear}{edu.gpa && ` • GPA: ${edu.gpa}`}</div>
                {edu.achievements && edu.achievements.trim() && (
                  <div className="mt-1 text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: edu.achievements }}></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && projects.some(proj => proj.title?.trim()) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Projects</h3>
            <div className="space-y-3">
              {projects.map((proj, index) => (
                <div key={index}>
                  <div className="text-sm font-medium">{proj.title} ({proj.date})</div>
                  {proj.description && proj.description.trim() && (
                    <div className="text-xs text-gray-600" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications Section */}
        {publications && publications.length > 0 && publications.some(pub => pub.title?.trim()) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Publications</h3>
            <div className="space-y-3">
              {publications.map((pub, index) => (
                <div key={index}>
                  <div className="text-sm font-medium">{pub.title} ({pub.date})</div>
                  <div className="text-xs text-gray-600">{pub.authors} - <i>{pub.journal}</i></div>
                  {pub.link && <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Link</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {certifications && certifications.length > 0 && certifications.some(cert => cert.name?.trim()) && (
          <div>
            <h3 className="text-sm font-medium mb-2">Certifications</h3>
            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index}>
                  <div className="text-sm font-medium">{cert.name}</div>
                  <div className="text-xs text-gray-500">{cert.issuer} • {cert.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeView;
