
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CareerPathway = () => {
  return (
    <Card className="border border-gray-200 h-full">
      <CardHeader>
        <CardTitle className="text-md font-bold text-gray-800">Career Pathway Explorer</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Select Role:</label>
          <select className="w-full text-sm border border-gray-200 rounded px-3 py-2">
            <option>Software Engineer</option>
            <option>Data Scientist</option>
            <option>Product Manager</option>
          </select>
        </div>
        
        <div className="placeholder-box h-[450px] relative">
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="text-gray-400 text-sm mb-4">Career Ladder with Salary Bands</div>
            
            {/* Career ladder visualization */}
            <div className="w-full max-w-xs">
              {/* Top level */}
              <div className="border border-gray-300 rounded p-3 mb-8 relative bg-white">
                <div className="font-medium text-sm">Principal Engineer</div>
                <div className="text-xs text-gray-500">$180K - $250K</div>
                <div className="absolute h-8 w-px bg-gray-300 bottom-full left-1/2"></div>
              </div>
              
              {/* Middle level */}
              <div className="border border-gray-300 rounded p-3 mb-8 relative bg-white">
                <div className="font-medium text-sm">Senior Engineer</div>
                <div className="text-xs text-gray-500">$120K - $180K</div>
                <div className="absolute h-8 w-px bg-gray-300 bottom-full left-1/2"></div>
              </div>
              
              {/* Highlighted current level */}
              <div className="border-2 border-gray-400 rounded p-3 mb-8 relative bg-gray-50">
                <div className="font-medium text-sm">Software Engineer</div>
                <div className="text-xs text-gray-500">$90K - $120K</div>
                <div className="absolute h-8 w-px bg-gray-300 bottom-full left-1/2"></div>
              </div>
              
              {/* Entry level */}
              <div className="border border-gray-300 rounded p-3 relative bg-white">
                <div className="font-medium text-sm">Associate Engineer</div>
                <div className="text-xs text-gray-500">$70K - $90K</div>
                <div className="absolute h-8 w-px bg-gray-300 bottom-full left-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerPathway;
