import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Briefcase, GraduationCap, Heart } from 'lucide-react';
import { Auth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import Firebase Auth functions

interface GoogleFlowProps {
  onComplete: () => void;
  authInstance: Auth; // Receive authInstance prop
}

const GoogleFlow = ({ onComplete, authInstance }: GoogleFlowProps) => {
  const [step, setStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState(''); // New state for auth errors
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    experience: '',
    skills: '',
    education: '',
    jobPreferences: '',
    interests: ''
  });

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setAuthError(''); // Clear previous errors
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(authInstance, provider);
      // The user's info can be accessed from result.user
      setProfileData({
        ...profileData,
        name: result.user.displayName || '',
        email: result.user.email || ''
      });
      setIsConnecting(false);
      setStep(1);
    } catch (error: any) {
      setAuthError(error.message);
      console.error("Google Sign-in Error:", error);
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      setStep(4);
      setTimeout(onComplete, 2000);
    }
  };

  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <svg className="mx-auto mb-4 w-16 h-16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <h2 className="text-3xl font-bold text-white mb-4">Continue with Google</h2>
            <p className="text-gray-300">
              Sign in with your Google account and we'll help you build your professional profile step by step.
            </p>
          </div>

          {isConnecting ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto"></div>
              <p className="text-red-300">Connecting to Google...</p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleGoogleConnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg rounded-xl font-semibold"
              >
                <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google Account
              </Button>
              {authError && <p className="text-red-400 text-sm mt-4">{authError}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  const steps = [
    {
      title: "Professional Experience",
      icon: <Briefcase className="text-blue-400" size={24} />,
      fields: [
        { key: 'experience', label: 'Tell us about your work experience', type: 'textarea', placeholder: 'e.g., Software Engineer at TechCorp, Freelance Developer...' }
      ]
    },
    {
      title: "Skills & Education", 
      icon: <GraduationCap className="text-green-400" size={24} />,
      fields: [
        { key: 'skills', label: 'What are your key skills?', type: 'input', placeholder: 'e.g., JavaScript, Python, Design, Project Management...' },
        { key: 'education', label: 'Your educational background', type: 'input', placeholder: 'e.g., BS Computer Science, Self-taught, Bootcamp...' }
      ]
    },
    {
      title: "Preferences & Interests",
      icon: <Heart className="text-purple-400" size={24} />,
      fields: [
        { key: 'jobPreferences', label: 'What type of roles interest you?', type: 'input', placeholder: 'e.g., Remote work, Startups, AI/ML, Full-stack development...' },
        { key: 'interests', label: 'Your career interests', type: 'textarea', placeholder: 'What excites you about technology and your career goals?' }
      ]
    }
  ];

  if (step >= 1 && step <= 3) {
    const currentStep = steps[step - 1];
    const progress = ((step) / 4) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <Progress value={progress} className="w-full h-2 mb-4" />
            <p className="text-gray-400 text-sm text-center">Step {step} of 3</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center mb-6">
              {currentStep.icon}
              <h2 className="text-2xl font-bold text-white ml-3">{currentStep.title}</h2>
            </div>

            <div className="space-y-4">
              {currentStep.fields.map((field) => (
                <div key={field.key}>
                  <Label className="text-white">{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={profileData[field.key as keyof typeof profileData]}
                      onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                      placeholder={field.placeholder}
                      className="bg-gray-700 border-gray-600 text-white"
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={profileData[field.key as keyof typeof profileData]}
                      onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                      placeholder={field.placeholder}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button 
              onClick={handleNext}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
            >
              {step === 3 ? 'Complete Setup' : 'Continue'}
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
          <h2 className="text-3xl font-bold text-white mb-4">Profile Created Successfully!</h2>
          <p className="text-gray-300">
            Analyzing your profile and generating personalized career insights...
          </p>
        </div>
        <Progress value={100} className="w-full" />
        <p className="text-green-400 mt-4">Almost ready! Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default GoogleFlow;

