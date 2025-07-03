
import React from 'react';
import { User, Calendar, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileHeader = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={32} className="text-gray-500" />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sarah Johnson</h1>
              <p className="text-sm text-gray-600">Senior UX Designer at Design Studio Inc.</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 rounded bg-gray-800 text-white text-sm font-medium">
                Match: 95%
              </div>
              <select className="border border-gray-200 rounded px-2 py-1 text-sm">
                <option>New Lead</option>
                <option>Screening</option>
                <option>Interview</option>
                <option>Offer</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-gray-400" />
              <span>5 years experience</span>
            </div>
            <div className="flex items-center">
              <Check size={16} className="mr-1 text-gray-400" />
              <span>Open to relocation</span>
            </div>
          </div>
        </div>
      </div>
      
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
