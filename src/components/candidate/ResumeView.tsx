
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ResumeView = () => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-md font-bold text-gray-800">Profile Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">About</h3>
          <p className="text-sm text-gray-600">Senior UX Designer with 5+ years of experience creating user-centered digital experiences for B2B and B2C products. Proficient in user research, wireframing, prototyping, and visual design.</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Experience</h3>
          <div className="space-y-4">
            <div className="border-l-2 border-gray-300 pl-4 pb-4 relative">
              <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-0"></div>
              <div className="text-sm font-medium">Design Studio Inc.</div>
              <div className="text-xs text-gray-500">Senior UX Designer • 2020-Present</div>
              <ul className="mt-2 text-xs text-gray-600 list-disc pl-4 space-y-1">
                <li>Led UX design for enterprise analytics dashboard</li>
                <li>Conducted user research with 100+ participants</li>
                <li>Created and managed design system components</li>
              </ul>
            </div>
            
            <div className="border-l-2 border-gray-300 pl-4 relative">
              <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-0"></div>
              <div className="text-sm font-medium">Tech Innovations</div>
              <div className="text-xs text-gray-500">Product Designer • 2018-2020</div>
              <ul className="mt-2 text-xs text-gray-600 list-disc pl-4 space-y-1">
                <li>Designed mobile applications for iOS and Android</li>
                <li>Improved user engagement by 22% through UX improvements</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Figma</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">User Research</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Wireframing</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Prototyping</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Design Systems</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">UI Design</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">User Testing</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Sketch</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Adobe XD</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Education</h3>
          <div className="text-sm">Bachelor of Fine Arts, Visual Design</div>
          <div className="text-xs text-gray-500">Rhode Island School of Design • 2014-2018</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeView;
