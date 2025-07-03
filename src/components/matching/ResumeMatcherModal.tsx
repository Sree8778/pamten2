
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ResumeMatcherModal = () => {
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Resume Matcher</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="text-sm font-medium">Job Description</div>
            <div className="border rounded p-4 h-80 overflow-auto bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Senior UX Designer</h3>
              <p className="text-sm text-gray-600 mb-3">
                We are looking for a <span className="bg-gray-200">Senior UX Designer</span> with at least <span className="bg-gray-200">5 years of experience</span> to join our team. The ideal candidate will have strong skills in <span className="bg-gray-200">user research</span>, <span className="bg-gray-200">wireframing</span>, <span className="bg-gray-200">prototyping</span>, and <span className="bg-gray-200">visual design</span>.
              </p>
              <h4 className="text-sm font-medium mb-1">Requirements:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Bachelor's degree in <span className="bg-gray-200">Design</span> or related field</li>
                <li>Proficiency in <span className="bg-gray-200">Figma</span>, Sketch, or Adobe XD</li>
                <li>Experience with <span className="bg-gray-200">design systems</span></li>
                <li>Strong portfolio showing <span className="bg-gray-200">UX process</span></li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm font-medium">Resume</div>
            <div className="border rounded p-4 h-80 overflow-auto bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Sarah Johnson</h3>
              <p className="text-sm text-gray-600 mb-3">
                <span className="bg-gray-300"><strong>Senior UX Designer</strong></span> with <span className="bg-gray-300"><strong>5+ years of experience</strong></span> creating user-centered digital experiences for B2B and B2C products. Proficient in <span className="bg-gray-300"><strong>user research</strong></span>, <span className="bg-gray-300"><strong>wireframing</strong></span>, <span className="bg-gray-300"><strong>prototyping</strong></span>, and <span className="bg-gray-300"><strong>visual design</strong></span>.
              </p>
              <h4 className="text-sm font-medium mb-1">Experience:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li><span className="bg-gray-300">Design Studio Inc. - <strong>Senior UX Designer</strong></span> (2020-Present)</li>
                <li>Created and managed <span className="bg-gray-300"><strong>design systems</strong></span> components</li>
              </ul>
              <h4 className="text-sm font-medium mt-2 mb-1">Education:</h4>
              <p className="text-sm text-gray-600">
                Bachelor of Fine Arts, <span className="bg-gray-300"><strong>Visual Design</strong></span><br />
                Rhode Island School of <span className="bg-gray-300"><strong>Design</strong></span> • 2014-2018
              </p>
              <h4 className="text-sm font-medium mt-2 mb-1">Skills:</h4>
              <p className="text-sm text-gray-600">
                <span className="bg-gray-300"><strong>Figma</strong></span>, <span className="bg-gray-300"><strong>User Research</strong></span>, Wireframing, Prototyping, <span className="bg-gray-300"><strong>Design Systems</strong></span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border rounded p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium mb-2">Semantic Similarity</div>
              <div className="h-4 w-full bg-gray-200 rounded">
                <div className="h-full rounded bg-gray-700 w-[95%]"></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0</span>
                <span className="font-medium">95%</span>
                <span>100</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Keyword Overlap</div>
              <div className="h-4 w-full bg-gray-200 rounded">
                <div className="h-full rounded bg-gray-700 w-[85%]"></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>0</span>
                <span className="font-medium">85%</span>
                <span>100</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-1">Key Matching Skills</div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">Senior UX Designer</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">5+ years experience</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">User Research</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">Design Systems</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">Figma</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline">Close</Button>
          <Button variant="outline">View Full Resume</Button>
          <Button>Add to Shortlist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeMatcherModal;
