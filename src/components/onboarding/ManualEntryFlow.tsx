import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, User, GraduationCap, Code, Target, Mail, Lock } from 'lucide-react';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseDb, getCurrentUserId, saveUserProfile } from '@/lib/firebase';

interface ManualEntryFlowProps {
  onComplete: () => void;
  authInstance: Auth;
  initialMode?: 'login' | 'signup';
}

const ManualEntryFlow = ({ onComplete, authInstance, initialMode = 'signup' }: ManualEntryFlowProps) => {
  const [step, setStep] = useState(0); // Step 0 for auth, then 1-4 for questionnaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    currentRole: '',
    experience: '',
    skills: '',
    education: '',
    interests: '',
    goals: ''
  });
  const [isSigningUp, setIsSigningUp] = useState(initialMode === 'signup');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setIsSigningUp(initialMode === 'signup');
  }, [initialMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isSigningUp) {
        const userCredential = await createUserWithEmailAndPassword(authInstance, formData.email, formData.password);
        // Save initial profile data (name, email, and default role) upon signup
        if (userCredential.user) {
          const userId = getCurrentUserId(userCredential.user);
          await saveUserProfile(userId, {
            name: formData.name,
            email: formData.email,
            role: "candidate", // Assign default role for new signups
            createdAt: new Date().toISOString()
          });
          console.log("Initial user profile saved on signup.");
        }
      } else {
        await signInWithEmailAndPassword(authInstance, formData.email, formData.password);
      }
      setStep(1); // Move to the next step after successful auth
    } catch (error: any) {
      setAuthError(error.message);
      console.error("Firebase Auth Error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleNext = async () => { // Made async to await saveUserProfile
    if (step === 0) { // For the initial auth step
      handleAuth();
    } else if (step < 4) { // For subsequent questionnaire steps (total 4 after auth)
      setStep(step + 1);
    } else { // Final step of questionnaire, save full profile and complete
      setAuthLoading(true); // Use authLoading for saving too
      try {
        const currentUser = authInstance.currentUser;
        if (currentUser) {
          const userId = getCurrentUserId(currentUser);
          // Prepare data to save - ensure all questionnaire data is included
          const profileToSave = {
            name: formData.name || currentUser.displayName || '',
            email: formData.email || currentUser.email || '',
            phone: formData.phone,
            currentRole: formData.currentRole,
            experience: formData.experience,
            skills: formData.skills,
            education: formData.education,
            interests: formData.interests,
            goals: formData.goals,
            lastUpdated: new Date().toISOString()
          };
          // The role will be merged from the initial signup. If this is a login,
          // the existing role in Firestore will be preserved due to merge: true.
          await saveUserProfile(userId, profileToSave);
          console.log("Full user profile saved after questionnaire.");
        }
        setStep(5); // Final completion step
        setTimeout(onComplete, 2000);
      } catch (error: any) {
        setAuthError(error.message); // Display error if saving fails
        console.error("Error saving full profile:", error);
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const totalSteps = 5; 
  const progress = ((step + 1) / totalSteps) * 100;

  if (step === totalSteps) { // Final completion screen (step 5)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="animate-pulse">
              <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Your Future!</h2>
            <p className="text-gray-300">
              Creating your personalized career dashboard...
            </p>
          </div>
          <Progress value={100} className="w-full" />
          <p className="text-green-400 mt-4">Profile setup complete! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
            {step === 0 ? <User className="mr-3 text-purple-400" size={32} /> : null}
            {step === 0 ? (isSigningUp ? "Create Your Account" : "Login to Your Account") : "Tell Us About Yourself"}
          </h2>
          <Progress value={progress} className="w-full mb-4" />
          <p className="text-gray-300">Step {step + 1} of {totalSteps} - Let's build your profile</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {step === 0 && ( // Initial Auth Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="mx-auto text-purple-400 mb-2" size={32} />
                <h3 className="text-xl font-bold text-white">{isSigningUp ? "Create Your Account" : "Login to Your Account"}</h3>
              </div>
              <div>
                <Label className="text-white flex items-center"><Mail className="mr-2" size={16} />Email Address *</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label className="text-white flex items-center"><Lock className="mr-2" size={16} />Password *</Label>
                <Input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="********"
                />
              </div>
              {isSigningUp && ( // Only show Full Name for signup
                <div>
                  <Label className="text-white">Full Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              {authError && <p className="text-red-400 text-sm">{authError}</p>}
              <Button 
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
                disabled={authLoading || !formData.email || !formData.password}
              >
                {authLoading ? "Processing..." : (isSigningUp ? "Sign Up" : "Login")}
              </Button>
              {/* Only show the toggle button if it's not a direct login/signup flow */}
              {initialMode === 'signup' && (
                <Button
                  onClick={() => setIsSigningUp(prev => !prev)}
                  variant="outline"
                  className="w-full py-3 rounded-xl font-semibold text-gray-300 border-gray-600 hover:bg-gray-700"
                  disabled={authLoading}
                >
                  {isSigningUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </Button>
              )}
            </div>
          )}

          {step === 1 && ( // Personal Info (if coming from auth) or Basic Info
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="mx-auto text-purple-400 mb-2" size={32} />
                <h3 className="text-xl font-bold text-white">Basic Information</h3>
              </div>
              <div>
                <Label className="text-white">Full Name *</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label className="text-white">Phone Number</Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <Button 
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold mt-8"
                disabled={!formData.name}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && ( // Professional Experience
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Code className="mx-auto text-blue-400 mb-2" size={32} />
                <h3 className="text-xl font-bold text-white">Professional Experience</h3>
              </div>
              <div>
                <Label className="text-white">Current Role/Status</Label>
                <Input 
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., Student, Junior Developer, Intern"
                />
              </div>
              <div>
                <Label className="text-white">Experience Level</Label>
                <select 
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="">Select your level</option>
                  <option value="student">Student/No Experience</option>
                  <option value="fresher">Fresh Graduate</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
              <div>
                <Label className="text-white">Skills & Technologies</Label>
                <Textarea 
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., JavaScript, Python, React, HTML/CSS, Problem Solving..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold mt-8"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 3 && ( // Education & Learning
            <div className="space-y-6">
              <div className="text-center mb-6">
                <GraduationCap className="mx-auto text-green-400 mb-2" size={32} />
                <h3 className="text-xl font-bold text-white">Education & Learning</h3>
              </div>
              <div>
                <Label className="text-white">Education Background</Label>
                <Textarea 
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., Computer Science Student at XYZ University, High School Graduate, Online Courses..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-white">Interests & Learning Areas</Label>
                <Textarea 
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., AI/ML, Web Development, Game Development, Mobile Apps..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold mt-8"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 4 && ( // Career Goals
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Target className="mx-auto text-yellow-400 mb-2" size={32} />
                <h3 className="text-xl font-bold text-white">Career Goals</h3>
              </div>
              <div>
                <Label className="text-white">What are your career goals?</Label>
                <Textarea 
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., Get my first tech job, Switch to AI field, Start my own company, Learn new technologies..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleNext}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold mt-8"
              >
                Complete Profile Setup
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualEntryFlow;

