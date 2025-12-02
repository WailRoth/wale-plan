"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "~/lib/auth/client";
import type { Session } from "~/lib/auth/config";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const result = await authClient.getSession();
      setSession(result.data ?? null);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setSession(null);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Still clear session locally even if sign out fails
      setSession(null);
    }
  };

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        const result = await authClient.getSession();
        setSession(result.data ?? null);
      } catch (error) {
        console.error("Failed to check session:", error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up session refresh interval
    const interval = setInterval(() => void checkSession(), 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const value = {
    session,
    isLoading,
    refreshSession,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}