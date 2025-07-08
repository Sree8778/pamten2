import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Using alias
import { CheckCircle, XCircle, FileText, UserCheck, ShieldCheck, ClipboardList, Clock } from 'lucide-react'; // Added icons
import { format } from 'date-fns'; // For date formatting
import { Button } from '@/components/ui/button'; // FIXED: Import Button

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
  parsedResumeContent?: ParsedResumeData; // Detailed parsed data from resume
  // Add any other fields relevant to background checks if they exist in userProfile or application
}

interface BackgroundCheckProps {
  candidate: CandidateProfile;
}

const BackgroundCheck: React.FC<BackgroundCheckProps> = ({ candidate }) => {
  // Mock data for background check status
  // In a real app, this would be fetched from a dedicated background check service or Firestore
  const mockBackgroundCheck = {
    reportId: "BG102458",
    initiatedDate: new Date("2025-05-10"),
    overallStatus: "Clear", // "Clear", "Pending", "Flagged"
    sections: [
      { name: "Identity Verification", status: "Completed", date: new Date("2025-05-10"), details: "Government ID verified" },
      { name: "Criminal History", status: "Completed", date: new Date("2025-05-12"), details: "No criminal records found" },
      { name: "Employment Verification", status: "Pending", date: null, details: "Contacting previous employers" },
      { name: "Education Verification", status: "Completed", date: new Date("2025-05-11"), details: "Degree from XYZ University verified" },
      { name: "Drug Screening", status: "Not Required", date: null, details: "" }
    ]
  };

  const getStatusIcon = (status: string) => {
    if (status === "Completed" || status === "Clear") {
      return <CheckCircle size={18} className="text-green-500 mr-2" />;
    } else if (status === "Pending") {
      return <Clock size={18} className="text-yellow-500 mr-2" />;
    } else if (status === "Flagged") {
      return <XCircle size={18} className="text-red-500 mr-2" />;
    } else {
      return <ClipboardList size={18} className="text-gray-500 mr-2" />;
    }
  };

  return (
    <Card className="border border-gray-200 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-bold text-gray-800 flex items-center justify-between">
          <span>Background Screening</span>
          <Button variant="outline" size="sm">View Full Report</Button>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          HireRight report initiated on {format(mockBackgroundCheck.initiatedDate, "PPP")} • Reference #{mockBackgroundCheck.reportId}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {mockBackgroundCheck.sections.map((section, index) => (
          <div key={index} className="flex items-start">
            {getStatusIcon(section.status)}
            <div>
              <p className="text-sm font-medium text-gray-800">{section.name} <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                section.status === 'Completed' ? 'bg-green-100 text-green-700' :
                section.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                section.status === 'Flagged' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}>{section.status}</span></p>
              {section.date && <p className="text-xs text-gray-500">Completed {format(section.date, "PPP")}</p>}
              {section.details && <p className="text-xs text-gray-600 mt-1">{section.details}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BackgroundCheck;
