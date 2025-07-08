import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Import Firebase initialization, getters, and new getUserProfile
import { initFirebase, getFirebaseAuth, getCurrentUserId, getUserProfile, saveUserProfile } from "./lib/firebase";
import { UserRoleProvider, useUserRole } from './contexts/UserRoleContext';

import Index from "./pages/Index";
import Insights from "./pages/Insights";
import Candidates from "./pages/Candidates";
import Screening from "./pages/Screening";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeMatcher from "./pages/ResumeMatcher";
import Jobs from "./pages/Jobs";
import Requisitions from "./pages/Requisitions";
import RecruiterRegistration from "./pages/RecruiterRegistration";
import Applications from "./pages/Applications";
import ApplyJob from './pages/ApplyJob';
import NewJobPage from '/src/pages/NewJobPage'; // Changed to absolute path from root


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

            let userProfile = null;
            let retryCount = 0;
            const maxRetries = 5;
            const retryDelay = 1000;

            while (retryCount < maxRetries) {
                userProfile = await getUserProfile(userId);
                if (userProfile && userProfile.role) {
                    let assignedRole = userProfile.role;
                    setUserRole(assignedRole);
                    break;
                }
                console.log(`App.tsx: User profile or role not found for ${userId}. Retrying... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                retryCount++;
            }

            if (!userProfile || !userProfile.role) {
                const profileToSave = {
                    ...(userProfile || {}),
                    role: "candidate",
                    email: currentUser.email,
                    name: currentUser.displayName || '',
                    createdAt: userProfile?.createdAt || new Date().toISOString()
                };
                await saveUserProfile(userId, profileToSave);
                setUserRole("candidate");
                console.log(`App.tsx: Assigned default role 'candidate' to ${userId} after retries and saved profile.`);
            }

            setIsLoadingRole(false);
            console.log("Current User ID:", userId, "Resolved Role:", userProfile?.role || "candidate");
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
        <p className="ml-4 text-gray-700 mt-4">Loading application...</p>
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

        <Route path="/dashboard" element={<Index />} />

        <Route path="/jobs" element={<Jobs />} />
        <Route path="/apply-job/:jobId" element={<ApplyJob />} />

        <Route path="/recruiter-registration" element={<RecruiterRegistration authInstance={authInstance} />} />

        <Route path="/insights" element={<Insights />} />
        <Route path="/requisitions" element={<Requisitions />} />
        <Route path="/requisitions/new" element={<NewJobPage />} />
        <Route path="/candidates/:applicantId?" element={<Candidates />} />
        <Route path="/screening" element={<Screening />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/resume-matcher" element={<ResumeMatcher />} />
        <Route path="/applications" element={<Applications />} />

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
