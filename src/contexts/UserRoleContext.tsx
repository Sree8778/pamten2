// src/contexts/UserRoleContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the possible roles
type UserRole = 'candidate' | 'recruiter' | 'admin' | null;

// Define the shape of the context value
interface UserRoleContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoadingRole: boolean;
  setIsLoadingRole: (loading: boolean) => void;
}

// Create the context with a default undefined value
const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// Custom hook to use the UserRoleContext
export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

// Provider component for the UserRoleContext
interface UserRoleProviderProps {
  children: ReactNode;
}

export const UserRoleProvider = ({ children }: UserRoleProviderProps) => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true); // State to indicate if role is being loaded

  const value = {
    userRole,
    setUserRole,
    isLoadingRole,
    setIsLoadingRole,
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};
