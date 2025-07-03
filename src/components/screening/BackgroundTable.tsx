
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const checkStatuses = {
  notStarted: 'bg-gray-100 text-gray-500',
  inProgress: 'bg-gray-200 text-gray-700',
  complete: 'bg-gray-700 text-white',
  failed: 'bg-gray-300 text-gray-700',
};

const backgroundChecks = [
  {
    id: 1,
    candidate: 'Sarah Johnson',
    position: 'Senior UX Designer',
    checkTypes: [
      { type: 'Identity', status: 'complete' },
      { type: 'Criminal', status: 'complete' },
      { type: 'Education', status: 'complete' },
      { type: 'Employment', status: 'inProgress' },
    ],
    country: 'United States',
    turnaround: '3-5 days',
    progress: 75,
  },
  {
    id: 2,
    candidate: 'Alex Rodriguez',
    position: 'Lead Product Designer',
    checkTypes: [
      { type: 'Identity', status: 'complete' },
      { type: 'Criminal', status: 'inProgress' },
      { type: 'Education', status: 'inProgress' },
      { type: 'Employment', status: 'notStarted' },
    ],
    country: 'United States',
    turnaround: '4-6 days',
    progress: 40,
  },
  {
    id: 3,
    candidate: 'Maria Garcia',
    position: 'Product Manager',
    checkTypes: [
      { type: 'Identity', status: 'complete' },
      { type: 'Criminal', status: 'complete' },
      { type: 'Education', status: 'failed' },
      { type: 'Employment', status: 'inProgress' },
    ],
    country: 'Spain',
    turnaround: '5-7 days',
    progress: 60,
  },
  {
    id: 4,
    candidate: 'David Kim',
    position: 'UI Designer',
    checkTypes: [
      { type: 'Identity', status: 'notStarted' },
      { type: 'Criminal', status: 'notStarted' },
      { type: 'Education', status: 'notStarted' },
      { type: 'Employment', status: 'notStarted' },
    ],
    country: 'South Korea',
    turnaround: '6-8 days',
    progress: 0,
  },
];

const BackgroundTable = () => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-bold text-gray-800">Background Check Dashboard</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Status:</span>
              <select className="text-xs border border-gray-200 rounded px-2 py-1">
                <option>All</option>
                <option>In Progress</option>
                <option>Complete</option>
                <option>Failed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Country:</span>
              <select className="text-xs border border-gray-200 rounded px-2 py-1">
                <option>All Countries</option>
                <option>United States</option>
                <option>International</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Types
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TAT SLA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backgroundChecks.map((check) => (
                <tr key={check.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-800">{check.candidate}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{check.position}</td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      {check.checkTypes.map((checkType, i) => (
                        <span 
                          key={i} 
                          className={`text-xs px-2 py-1 rounded ${checkStatuses[checkType.status as keyof typeof checkStatuses]}`}
                        >
                          {checkType.type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{check.country}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{check.turnaround}</td>
                  <td className="px-4 py-4">
                    <div className="w-32">
                      <div className="h-2 bg-gray-100 rounded">
                        <div 
                          className="h-full bg-gray-600 rounded" 
                          style={{ width: `${check.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{check.progress}%</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackgroundTable;
