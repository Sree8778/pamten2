
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MarketHeatmap = () => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-md font-bold text-gray-800">Talent Market Insights</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Filter by:</span>
              <select className="text-xs border border-gray-200 rounded px-2 py-1">
                <option>All Roles</option>
                <option>Software Engineers</option>
                <option>Data Scientists</option>
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">Time period:</span>
              <select className="text-xs border border-gray-200 rounded px-2 py-1">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="placeholder-box h-[400px] relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-gray-400 text-md font-medium mb-2">Full-Width Interactive U.S. Heatmap</div>
            <div className="text-xs text-gray-500">Hover = open roles vs. talent supply</div>
          </div>
          
          {/* USA outline */}
          <div className="w-3/4 h-3/4 mx-auto border border-gray-300 rounded relative">
            {/* Represent states as blocks with different shades */}
            <div className="absolute top-1/5 left-1/6 w-12 h-12 bg-gray-200 border border-gray-300"></div>
            <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gray-400 border border-gray-300">
              <div className="h-full flex items-center justify-center text-white text-xs">NY</div>
            </div>
            <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gray-600 border border-gray-300">
              <div className="h-full flex items-center justify-center text-white text-xs">CA</div>
            </div>
            <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gray-300 border border-gray-300">
              <div className="h-full flex items-center justify-center text-xs">TX</div>
            </div>
            
            {/* Hover tooltip example */}
            <div className="absolute top-1/4 left-1/4 w-40 bg-white shadow-lg p-2 rounded border border-gray-200 text-left">
              <div className="font-medium text-xs mb-1">New York</div>
              <div className="flex justify-between text-xs mb-1">
                <span>Open roles:</span>
                <span className="font-medium">2,450</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Qualified talent:</span>
                <span className="font-medium">1,250</span>
              </div>
              <div className="mt-1 h-1 w-full bg-gray-200">
                <div className="h-1 bg-gray-600 w-[40%]"></div>
              </div>
              <div className="text-xs text-right mt-1 text-gray-500">Demand/Supply: 1.96</div>
            </div>
          </div>
          
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <div className="text-xs">Balanced</div>
            <div className="w-32 h-3 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700"></div>
            <div className="text-xs">High Demand</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketHeatmap;
