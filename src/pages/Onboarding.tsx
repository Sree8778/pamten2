import React, { useState } from 'react';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import TechQuestionnaire from '@/components/onboarding/TechQuestionnaire';
import AuthOptions from '@/components/onboarding/AuthOptions';
import LinkedInFlow from '@/components/onboarding/LinkedInFlow';
import GoogleFlow from '@/components/onboarding/GoogleFlow';
import ManualEntryFlow from '@/components/onboarding/ManualEntryFlow';
import SignInOptions from '@/components/onboarding/SignInOptions'; // Import the new SignInOptions component
import { Auth } from 'firebase/auth';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
  authInstance: Auth;
}

const Onboarding = ({ authInstance }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [questionnaireData, setQuestionnaireData] = useState({});

  const handleNextStep = (data?: any) => {
    if (data) {
      setQuestionnaireData(prev => ({ ...prev, ...data }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleAuthChoice = (provider: 'linkedin' | 'google' | 'manual') => {
    setQuestionnaireData(prev => ({ ...prev, authProvider: provider }));
    if (provider === 'linkedin') setCurrentStep(3); // LinkedIn flow is step 3
    else if (provider === 'google') setCurrentStep(4); // Google flow is step 4
    else if (provider === 'manual') setCurrentStep(5); // Manual entry for signup is step 5
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Initial screen: Choose Sign Up or Sign In
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg mx-auto text-center">
              <h1 className="text-4xl font-bold text-white mb-6">
                Start Your Career Journey
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Choose how you'd like to begin:
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => setCurrentStep(1)} // Go to Tech Questionnaire (start signup flow)
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  Sign Up (New Account) 🚀
                </Button>
                <Button
                  onClick={() => setCurrentStep(6)} // Now, this will directly go to the SignInOptions component
                  variant="outline"
                  className="w-full text-gray-300 border-purple-600 hover:bg-purple-700 hover:text-white py-6 text-lg rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  Already have an account? Sign In
                </Button>
              </div>
            </div>
          </div>
        );
      case 1: // Tech Questionnaire (first step after "Sign Up")
        return <TechQuestionnaire onComplete={handleNextStep} />;
      case 2: // Auth Options (after Tech Questionnaire, if not directly manual/google)
        return <AuthOptions onSelect={handleAuthChoice} data={questionnaireData} authInstance={authInstance} />;
      case 3: // LinkedIn Flow
        return <LinkedInFlow onComplete={() => window.location.href = '/dashboard'} />;
      case 4: // Google Flow (via AuthOptions)
        return <GoogleFlow onComplete={() => window.location.href = '/dashboard'} authInstance={authInstance} />;
      case 5: // Manual Entry Flow (via AuthOptions, for signup)
        return <ManualEntryFlow onComplete={() => window.location.href = '/dashboard'} authInstance={authInstance} initialMode="signup" />;
      case 6: // THIS IS THE CRUCIAL CHANGE: Render SignInOptions directly
        return (
            <SignInOptions 
                onComplete={() => window.location.href = '/dashboard'} 
                authInstance={authInstance} 
                onSwitchToSignup={() => setCurrentStep(1)} // If user decides to signup from signin options, go to Tech Questionnaire
            />
        );
      default:
        // Fallback to initial choice screen if an invalid step is reached
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-lg mx-auto text-center">
              <h1 className="text-4xl font-bold text-white mb-6">
                Welcome Back!
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Something went wrong, please choose an option to continue.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl font-semibold"
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => setCurrentStep(6)} // Navigate to the combined SignInOptions
                  variant="outline"
                  className="w-full text-gray-300 border-purple-600 hover:bg-purple-700 hover:text-white py-6 text-lg rounded-xl font-semibold"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {renderStep()}
    </div>
  );
};

export default Onboarding;
