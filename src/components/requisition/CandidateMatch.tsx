
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

const candidates = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Senior UX Designer',
    company: 'Design Studio Inc.',
    matchScore: 95,
    tags: ['Figma', 'User Research', 'Design Systems']
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Designer',
    company: 'Tech Innovations',
    matchScore: 88,
    tags: ['UI Design', 'Prototyping', 'Wireframing']
  },
  {
    id: 3,
    name: 'Alex Rodriguez',
    role: 'Lead Product Designer',
    company: 'Creative Solutions',
    matchScore: 82,
    tags: ['Design Strategy', 'Team Leadership', 'Figma']
  },
  {
    id: 4,
    name: 'Jessica Williams',
    role: 'UX/UI Designer',
    company: 'Digital Agency',
    matchScore: 76,
    tags: ['Visual Design', 'User Testing', 'Sketch']
  }
];

const CandidateMatch = () => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-bold text-gray-800">Auto-Match Candidates</CardTitle>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select className="text-xs border border-gray-200 rounded px-2 py-1">
              <option>Match Score</option>
              <option>Recent Activity</option>
              <option>Experience</option>
            </select>
          </div>
        </div>
        
        <div className="flex mt-2 border-b border-gray-100">
          <button className="px-3 py-2 text-sm font-medium border-b-2 border-gray-800">
            Auto-Matches (12)
          </button>
          <button className="px-3 py-2 text-sm text-gray-500">
            Applied (5)
          </button>
          <button className="px-3 py-2 text-sm text-gray-500">
            Shortlisted (3)
          </button>
          <button className="px-3 py-2 text-sm text-gray-500">
            Interviewed (0)
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {candidates.map(candidate => (
            <div key={candidate.id} className="p-4 flex items-start">
              <div className="mr-3 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={24} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800">{candidate.name}</p>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    candidate.matchScore >= 90 ? 'bg-gray-800 text-white' : 
                    candidate.matchScore >= 80 ? 'bg-gray-600 text-white' : 
                    'bg-gray-200 text-gray-800'
                  }`}>
                    Match: {candidate.matchScore}%
                  </div>
                </div>
                <p className="text-sm text-gray-600">{candidate.role} at {candidate.company}</p>
                <div className="flex flex-wrap mt-2 gap-1">
                  {candidate.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateMatch;
