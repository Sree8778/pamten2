import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  User,
  File,
  Check,
  Settings,
  LogOut,
  BriefcaseBusiness, // Icon for Resume Builder/Matcher
  ShieldAlert, // Icon for Admin items (e.g., Settings)
  ClipboardList, // New icon for Job Listings
  MailOpen // NEW: Imported MailOpen icon for Applications
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getFirebaseAuth, getCurrentUserId } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { useUserRole } from '@/contexts/UserRoleContext'; // Import useUserRole

const Sidebar = () => {
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
    { name: 'Home', icon: <Home size={24} />, path: '/dashboard', roles: ['candidate', 'recruiter', 'admin'] },
    { name: 'Market Insights', icon: <LayoutDashboard size={24} />, path: '/insights', roles: ['candidate', 'recruiter', 'admin'] },
    
    // Candidate-specific items
    { name: 'Job Listings', icon: <ClipboardList size={24} />, path: '/jobs', roles: ['candidate'] },
    { name: 'Resume Builder', icon: <BriefcaseBusiness size={24} />, path: '/resume-builder', roles: ['candidate'] },
    { name: 'Resume Matcher', icon: <BriefcaseBusiness size={24} />, path: '/resume-matcher', roles: ['candidate'] },

    // Recruiter/Admin-specific items
    { name: 'Requisitions', icon: <File size={24} />, path: '/requisitions', roles: ['recruiter', 'admin'] },
    { name: 'Candidates', icon: <User size={24} />, path: '/candidates', roles: ['recruiter', 'admin'] },
    { name: 'Screening', icon: <Check size={24} />, path: '/screening', roles: ['recruiter', 'admin'] },
    { name: 'Applications', icon: <MailOpen size={24} />, path: '/applications', roles: ['recruiter', 'admin'] }, // NEW: Applications for recruiters/admins
    
    // Admin-specific items
    { name: 'Settings', icon: <Settings size={24} />, path: '/settings', roles: ['admin'] },
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

  const isNavItemVisible = (itemRoles: string[]) => {
    // If during initial loading or if user is truly unauthenticated/no role resolved, hide all.
    // The App.tsx loading spinner handles initial auth loading.
    if (isLoadingRole || !userRole) {
      return false;
    }
    // Check if the current user's role is included in the item's allowed roles.
    return itemRoles.includes(userRole);
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
            isNavItemVisible(item.roles) && (
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
            )
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

export default Sidebar;
