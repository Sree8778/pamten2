
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Linkedin, Briefcase, GraduationCap, Award } from 'lucide-react';

interface LinkedInFlowProps {
  onComplete: () => void;
}

const LinkedInFlow = ({ onComplete }: LinkedInFlowProps) => {
  const [step, setStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    title: '',
    experience: '',
    skills: '',
    education: '',
    certifications: ''
  });

  const handleLinkedInConnect = () => {
    setIsConnecting(true);
    
    // Simulate LinkedIn API connection
    setTimeout(() => {
      setProfileData({
        name: 'Alex Johnson',
        title: 'Junior Software Developer',
        experience: 'Software Developer at TechCorp (2022-Present)\nIntern at StartupXYZ (2021-2022)',
        skills: 'JavaScript, React, Python, Node.js, Git, SQL',
        education: 'Bachelor of Computer Science - State University (2018-2022)',
        certifications: 'AWS Cloud Practitioner, Google Analytics Certified'
      });
      setIsConnecting(false);
      setStep(1);
    }, 2000);
  };

  const handleSaveProfile = () => {
    setStep(2);
    setTimeout(onComplete, 2000);
  };

  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <Linkedin className="mx-auto text-blue-400 mb-4" size={64} />
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your LinkedIn</h2>
            <p className="text-gray-300">
              We'll automatically import your professional experience, skills, education, and certifications to create your perfect profile.
            </p>
          </div>

          {isConnecting ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-blue-300">Connecting to LinkedIn...</p>
              <p className="text-gray-400 text-sm">Importing your professional data securely</p>
            </div>
          ) : (
            <Button
              onClick={handleLinkedInConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg rounded-xl font-semibold"
            >
              <Linkedin className="mr-2" size={20} />
              Connect LinkedIn Account
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-green-400 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-white">Profile Imported Successfully!</h2>
            </div>
            <p className="text-gray-300">Review and confirm your information below:</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Full Name</Label>
                <Input 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Current Title</Label>
                <Input 
                  value={profileData.title}
                  onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white flex items-center">
                <Briefcase className="mr-2" size={16} />
                Professional Experience
              </Label>
              <Textarea 
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-white">Skills</Label>
              <Input 
                value={profileData.skills}
                onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white flex items-center">
                <GraduationCap className="mr-2" size={16} />
                Education
              </Label>
              <Input 
                value={profileData.education}
                onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-white flex items-center">
                <Award className="mr-2" size={16} />
                Certifications
              </Label>
              <Input 
                value={profileData.certifications}
                onChange={(e) => setProfileData({...profileData, certifications: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Button 
              onClick={handleSaveProfile}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
            >
              Complete Profile Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="animate-pulse">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to Your Future!</h2>
          <p className="text-gray-300">
            Creating your personalized career dashboard with AI-powered insights...
          </p>
        </div>
        <Progress value={100} className="w-full" />
        <p className="text-green-400 mt-4">Profile setup complete! Redirecting...</p>
      </div>
    </div>
  );
};

export default LinkedInFlow;
