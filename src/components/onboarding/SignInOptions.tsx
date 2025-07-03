// src/components/onboarding/SignInOptions.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import { Auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface SignInOptionsProps {
  onComplete: () => void; // Callback to navigate to dashboard
  authInstance: Auth; // Firebase Auth instance
  onSwitchToSignup: () => void; // Callback to go back to main signup options
}

const SignInOptions = ({ onComplete, authInstance, onSwitchToSignup }: SignInOptionsProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleManualSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(authInstance, email, password);
      onComplete(); // Navigate to dashboard on success
    } catch (err: any) {
      setError(err.message);
      console.error("Manual Sign-in Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(authInstance, provider);
      onComplete(); // Navigate to dashboard on success
    } catch (err: any) {
      setError(err.message);
      console.error("Google Sign-in Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Sign In to Your Account
          </h1>
          <p className="text-gray-300 text-lg">
            Access your personalized career insights
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 space-y-6">
          {/* Google Sign-in Button */}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg rounded-xl font-semibold flex items-center justify-center gap-3 transform hover:scale-105 transition-all duration-200"
            disabled={loading}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In with Google
          </Button>

          {/* Separator */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          {/* Email/Password Login Form */}
          <div className="space-y-4">
            <div>
              <Label className="text-white flex items-center"><Mail className="mr-2" size={16} />Email Address</Label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label className="text-white flex items-center"><Lock className="mr-2" size={16} />Password</Label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="********"
                disabled={loading}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button 
              onClick={handleManualSignIn}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
              disabled={loading || !email || !password}
            >
              {loading ? "Signing In..." : "Sign In with Email"}
            </Button>
          </div>

          {/* Switch to Sign Up */}
          <Button 
            onClick={onSwitchToSignup}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white mt-4"
            disabled={loading}
          >
            Don't have an account? Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignInOptions;
