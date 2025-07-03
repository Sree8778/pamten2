
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HeatmapPlaceholder = () => {
  return (
    <Card className="border border-gray-200 h-[320px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-bold text-gray-800">Supply-Demand Heatmap</CardTitle>
        <div className="text-xs text-gray-500">Select Region ▼</div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="placeholder-box h-[230px] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-sm font-medium">U.S. Map Heatmap Visualization</div>
          </div>
          
          {/* USA outline */}
          <div className="w-2/3 h-2/3 mx-auto border border-gray-300 rounded relative">
            <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-300 rounded-full opacity-70">
              <div className="text-xs text-center mt-2">NY</div>
            </div>
            <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-gray-500 rounded-full opacity-70">
              <div className="text-xs text-center mt-3 text-white">CA</div>
            </div>
            <div className="absolute bottom-1/4 left-1/2 w-6 h-6 bg-gray-200 rounded-full opacity-70">
              <div className="text-xs text-center mt-1">TX</div>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <div className="text-xs">Low</div>
            <div className="w-24 h-3 bg-gradient-to-r from-gray-200 to-gray-600"></div>
            <div className="text-xs">High</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapPlaceholder;
