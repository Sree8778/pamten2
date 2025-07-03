import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Import Firebase initialization, getters, and new getUserProfile
import { initFirebase, getFirebaseAuth, getCurrentUserId, getUserProfile, saveUserProfile } from "./lib/firebase";
import { UserRoleProvider, useUserRole } from './contexts/UserRoleContext';

import Index from "./pages/Index"; // This will now be the role-based dashboard router
import Insights from "./pages/Insights";
import Requisitions from "./pages/Requisitions";
import Candidates from "./pages/Candidates";
import Screening from "./pages/Screening";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeMatcher from "./pages/ResumeMatcher";
import Jobs from "./pages/Jobs";
import RecruiterRegistration from "./pages/RecruiterRegistration"; 
import Applications from "./pages/Applications"; 


const queryClient = new QueryClient();

// Main App content component that consumes UserRoleContext
const AppContent = () => {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { setUserRole, setIsLoadingRole } = useUserRole();

  useEffect(() => {
    const initialize = async () => {
      try {
        const { authInstance } = await initFirebase();
        setFirebaseInitialized(true);

        const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            const userId = getCurrentUserId(currentUser);
            setIsLoadingRole(true);

            let assignedRole = "candidate"; // Default to candidate if no role is found

            // Attempt to fetch user profile with a retry mechanism
            let userProfile = null;
            let retryCount = 0;
            const maxRetries = 5;
            const retryDelay = 1000; // 1 second delay

            while (retryCount < maxRetries) {
                userProfile = await getUserProfile(userId);
                if (userProfile && userProfile.role) {
                    assignedRole = userProfile.role;
                    break; // Role found, exit retry loop
                }
                console.log(`App.tsx: User profile or role not found for ${userId}. Retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryCount++;
            }

            if (!userProfile || !userProfile.role) {
                // If after retries, role is still not found, explicitly save as candidate
                const profileToSave = {
                    ...(userProfile || {}), // Preserve any existing data if profile exists but role is missing
                    role: "candidate", // Default new users to candidate
                    email: currentUser.email,
                    name: currentUser.displayName || '',
                    createdAt: userProfile?.createdAt || new Date().toISOString()
                };
                await saveUserProfile(userId, profileToSave);
                console.log(`App.tsx: Assigned default role 'candidate' to ${userId} after retries and saved profile.`);
            }
            
            setUserRole(assignedRole);
            setIsLoadingRole(false);
            console.log("Current User ID:", userId, "Resolved Role:", assignedRole);
          } else {
            setUserRole(null);
            setIsLoadingRole(false);
            console.log("No user logged in or anonymous.");
          }
          setLoadingAuth(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Failed to initialize Firebase or set up auth listener:", error);
        setLoadingAuth(false);
        setIsLoadingRole(false);
      }
    };

    initialize();
  }, []);

  if (loadingAuth || !firebaseInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-700">Loading application...</p>
      </div>
    );
  }

  const initialRoute = user ? "/dashboard" : "/onboarding";
  const authInstance = getFirebaseAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={initialRoute} replace />} />
        <Route path="/onboarding" element={<Onboarding authInstance={authInstance} />} /> 
        
        {/* The /dashboard route now points to the Index component which acts as a router */}
        <Route path="/dashboard" element={<Index />} /> 
        
        {/* New route for Job Listings page */}
        <Route path="/jobs" element={<Jobs />} />

        {/* New route for Recruiter Registration page */}
        <Route path="/recruiter-registration" element={<RecruiterRegistration authInstance={authInstance} />} />

        {/* Existing routes */}
        <Route path="/insights" element={<Insights />} />
        <Route path="/requisitions" element={<Requisitions />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/screening" element={<Screening />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/resume-matcher" element={<ResumeMatcher />} />
        <Route path="/applications" element={<Applications />} />

        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserRoleProvider>
        <AppContent />
      </UserRoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
