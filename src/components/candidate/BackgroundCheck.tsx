
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const statusItems = [
  { 
    id: 1, 
    label: 'Identity Verification', 
    status: 'completed', 
    date: 'Completed May 10, 2025',
    description: 'Government ID verified'
  },
  { 
    id: 2, 
    label: 'Education Verification', 
    status: 'completed', 
    date: 'Completed May 11, 2025',
    description: 'RISD degree verified'
  },
  { 
    id: 3, 
    label: 'Employment History', 
    status: 'in-progress', 
    date: 'In Progress',
    description: 'Verifying Design Studio Inc.'
  },
  { 
    id: 4, 
    label: 'Criminal Record Check', 
    status: 'pending', 
    date: 'Pending',
    description: 'Waiting to initiate'
  }
];

const BackgroundCheck = () => {
  return (
    <Card className="border border-gray-200 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-bold text-gray-800">Background Screening</CardTitle>
          <button className="text-xs bg-gray-100 px-3 py-1 rounded">
            View Full Report
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-xs text-gray-500 mb-4">
          HireRight report initiated on May 10, 2025 • Reference #BG102458
        </div>
        
        <div className="relative">
          {/* Vertical line for timeline */}
          <div className="absolute left-[8px] top-0 bottom-0 w-[2px] bg-gray-200"></div>
          
          {/* Timeline items */}
          <div className="space-y-6">
            {statusItems.map((item) => (
              <div key={item.id} className="flex">
                <div className={`z-10 w-4 h-4 rounded-full flex-shrink-0 mt-1 ${
                  item.status === 'completed' 
                    ? 'bg-gray-600 text-white' 
                    : item.status === 'in-progress' 
                      ? 'bg-white border-2 border-gray-400' 
                      : 'bg-white border-2 border-gray-200'
                }`}>
                  {item.status === 'completed' && (
                    <Check size={14} className="m-auto" />
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.date}</div>
                  <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-100 pt-4">
          <div className="text-sm font-medium mb-2">Overall Status</div>
          <div className="h-2 w-full bg-gray-100 rounded">
            <div className="h-full rounded bg-gray-400 w-[60%]"></div>
          </div>
          <div className="text-xs text-right mt-1 text-gray-500">60% Complete</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackgroundCheck;
