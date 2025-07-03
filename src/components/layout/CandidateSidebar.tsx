// src/components/layout/CandidateSidebar.tsx
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  ClipboardList,
  BriefcaseBusiness,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getFirebaseAuth, getCurrentUserId } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useUserRole } from '@/contexts/UserRoleContext';

const CandidateSidebar = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { userRole, isLoadingRole } = useUserRole();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setCurrentUserId(getCurrentUserId(currentUser));
      });
      return () => unsubscribe();
    }
  }, []);

  const navItems = [
    { name: 'Home', icon: <Home size={24} />, path: '/dashboard' },
    { name: 'Market Insights', icon: <LayoutDashboard size={24} />, path: '/insights' },
    { name: 'Job Listings', icon: <ClipboardList size={24} />, path: '/jobs' },
    { name: 'Resume Builder', icon: <BriefcaseBusiness size={24} />, path: '/resume-builder' },
    { name: 'Resume Matcher', icon: <BriefcaseBusiness size={24} />, path: '/resume-matcher' },
    // Add other candidate-specific items here
  ];

  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
        console.log("User signed out from Firebase.");
        window.location.href = '/onboarding';
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-100 border-r border-gray-200 z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center h-10">
          <div className="font-bold text-lg text-gray-800">CareerVerse</div>
        </div>
        <div className="text-xs text-center text-gray-500 mt-1">Your Career Universe</div>
        {isLoadingRole ? (
          <div className="text-xs text-center text-gray-400 mt-1">Loading role...</div>
        ) : (
          userRole ? <div className="text-xs text-center text-gray-600 mt-1 capitalize">Role: {userRole}</div> :
          <div className="text-xs text-center text-gray-600 mt-1">Role: N/A</div>
        )}
      </div>
      
      <nav className="flex-1 pt-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center h-12 px-4 rounded-md text-gray-600 hover:bg-gray-200 transition-colors",
                    isActive && "bg-gray-200 text-gray-900"
                  )
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        {user ? (
          <div className="mb-2 text-sm text-gray-700 break-words">
            Logged in as:<br/>
            <span className="font-medium">{user.email || currentUserId}</span>
          </div>
        ) : (
          <div className="mb-2 text-sm text-gray-500">Not logged in</div>
        )}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center justify-start h-12 px-4 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default CandidateSidebar;
