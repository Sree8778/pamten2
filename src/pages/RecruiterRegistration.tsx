// src/pages/RecruiterRegistration.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Building, User } from 'lucide-react';
import { Auth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getCurrentUserId, saveUserProfile } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

interface RecruiterRegistrationProps {
  authInstance: Auth;
}

const RecruiterRegistration = ({ authInstance }: RecruiterRegistrationProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    recruiterId: '', // Optional: could be used for verification or internal tracking
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate hook

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecruiterSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, formData.email, formData.password);
      
      if (userCredential.user) {
        const userId = getCurrentUserId(userCredential.user);
        await saveUserProfile(userId, {
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          recruiterId: formData.recruiterId,
          role: "recruiter", // Explicitly assign 'recruiter' role
          createdAt: new Date().toISOString()
        });
        console.log("Recruiter profile saved successfully.");
        navigate('/dashboard'); // Redirect to dashboard after successful signup
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Firebase Recruiter Signup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Recruiter Registration 💼
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Create your account to start managing requisitions
        </p>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 space-y-6">
          <div>
            <Label className="text-white flex items-center"><Mail className="mr-2" size={16} />Work Email *</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="recruiter.email@example.com"
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
          <div>
            <Label className="text-white flex items-center"><User className="mr-2" size={16} />Full Name</Label>
            <Input 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Your Name"
            />
          </div>
          <div>
            <Label className="text-white flex items-center"><Building className="mr-2" size={16} />Company Name</Label>
            <Input 
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Your Company Inc."
            />
          </div>
          {/* Optional: Recruiter ID for internal use */}
          {/* <div>
            <Label className="text-white flex items-center">Recruiter ID (Optional)</Label>
            <Input 
              value={formData.recruiterId}
              onChange={(e) => handleInputChange('recruiterId', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., RCR001"
            />
          </div> */}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button 
            onClick={handleRecruiterSignUp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold mt-6"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? "Registering..." : "Register as Recruiter"}
          </Button>
          <Button 
            onClick={() => navigate('/onboarding')} // Go back to main onboarding choices
            variant="ghost"
            className="w-full text-gray-400 hover:text-white mt-4"
            disabled={loading}
          >
            Back to Sign In/Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterRegistration;
