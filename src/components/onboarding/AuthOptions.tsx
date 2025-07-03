import React from 'react';
import { Button } from '@/components/ui/button';
import { Linkedin, UserPlus } from 'lucide-react';
import { Auth } from 'firebase/auth'; // Import Auth type

interface AuthOptionsProps {
  onSelect: (provider: 'linkedin' | 'google' | 'manual') => void;
  data: any;
  authInstance: Auth; // Add authInstance prop
}

const AuthOptions = ({ onSelect, data, authInstance }: AuthOptionsProps) => {
  const getJobMatches = () => {
    // Mock calculation based on questionnaire data
    const baseJobs = 1247;
    const baseCompanies = 89;
    
    if (data.dreamJob === 'ai-engineer') return { jobs: baseJobs + 200, companies: baseCompanies + 15 };
    if (data.dreamJob === 'gamedev') return { jobs: baseJobs - 100, companies: baseCompanies - 5 };
    return { jobs: baseJobs, companies: baseCompanies };
  };

  const { jobs, companies } = getJobMatches();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 You're Almost There!
          </h1>
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-400/30 mb-6">
            <p className="text-lg text-green-300 font-semibold">
              Based on your answers, there are{' '}
              <span className="text-white font-bold">{jobs.toLocaleString()} jobs</span> and{' '}
              <span className="text-white font-bold">{companies} companies</span>{' '}
              currently matching your profile!
            </p>
          </div>
          <p className="text-gray-300 text-lg">
            Choose how you'd like to continue and unlock your personalized career insights
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => onSelect('linkedin')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl font-semibold flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-200"
          >
            <Linkedin size={24} />
            Continue with LinkedIn
            <span className="text-blue-200 text-sm ml-2">• Auto-imports your experience</span>
          </Button>

          <Button
            onClick={() => onSelect('google')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg rounded-xl font-semibold flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            <span className="text-red-200 text-sm ml-2">• Quick setup</span>
          </Button>

          <Button
            onClick={() => onSelect('manual')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl font-semibold flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-200"
          >
            <UserPlus size={24} />
            Enter Details Manually
            <span className="text-purple-200 text-sm ml-2">• Perfect for students & freshers</span>
          </Button>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          🔒 Your data is encrypted and secure. We never share your information.
        </p>
      </div>
    </div>
  );
};

export default AuthOptions;

