import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [localUser, setLocalUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // This function syncs the Clerk user to our backend and gets the full profile
  const refreshUser = useCallback(async () => {
    if (!isSignedIn || !clerkUser) return null;
    setIsSyncing(true);
    try {
      const response = await axiosClient.post('/auth/sync', {
        name: clerkUser.fullName || clerkUser.username || "Anonymous",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        age: 0,
        userType: "LEARNER",
        skillsWanted: ["General"],
        skillsOffered: []
      });
      setLocalUser(response.data);
      return response.data;
    } catch (e) {
      console.error("Failed to sync user with backend", e);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (isSignedIn && clerkUser && !localUser) {
      refreshUser();
    } else if (!isSignedIn) {
      setLocalUser(null);
    }
  }, [isSignedIn, clerkUser, localUser, refreshUser]);

  const logout = useCallback(() => {
    signOut();
    setLocalUser(null);
  }, [signOut]);

  const updateLocalUser = useCallback((partialUser) => {
    setLocalUser((prev) => ({ ...prev, ...partialUser }));
  }, []);

  const onboardUser = useCallback(async (onboardingData) => {
    setIsSyncing(true);
    try {
      const response = await axiosClient.put('/auth/onboard', onboardingData);
      setLocalUser(response.data);
      return response.data;
    } catch (e) {
      console.error("Failed to onboard user", e);
      throw e;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const token = isSignedIn ? "clerk-token-active" : null;

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fff7ed]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user: localUser, token, isSyncing, logout, refreshUser, updateLocalUser, onboardUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
