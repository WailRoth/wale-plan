"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "~/trpc/react";
import type { organizations, organizationMembers } from "~/server/db/schema";

// Infer types from Drizzle schema (T3 Stack best practice)
type Organization = typeof organizations.$inferSelect;
type OrganizationMember = typeof organizationMembers.$inferSelect;

export type UserOrganization = {
  id: Organization["id"];
  name: Organization["name"];
  timezone: Organization["timezone"];
  role: OrganizationMember["role"];
};

interface OrganizationContextType {
  currentOrganization: UserOrganization | null;
  organizations: UserOrganization[];
  isLoading: boolean;
  error: Error | null;
  switchOrganization: (organizationId: number) => void;
  clearOrganization: () => void;
  refetch: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganizationId, setCurrentOrganizationId] = useState<number | null>(
    () => {
      // Initialize from localStorage if available
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('currentOrganizationId');
        return stored ? parseInt(stored, 10) : null;
      }
      return null;
    }
  );

  const {
    data: orgsData,
    isLoading,
    error,
    refetch,
  } = api.organization.getUserOrganizations.useQuery();

  const organizations = orgsData?.success ? orgsData.data : [];

  const currentOrganization = organizations.find(
    (org) => org.id === currentOrganizationId
  ) ?? (organizations.length > 0 ? organizations[0] : null);

  // Ensure we don't return undefined
  const safeCurrentOrganization: UserOrganization | null = currentOrganization ?? null;

  // Update localStorage when current organization changes
  useEffect(() => {
    if (currentOrganization && typeof window !== 'undefined') {
      localStorage.setItem('currentOrganizationId', currentOrganization.id.toString());
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('currentOrganizationId');
    }
  }, [currentOrganization]);

  // Auto-select first organization if none selected and organizations are loaded
  useEffect(() => {
    if (!currentOrganizationId && organizations.length > 0) {
      setCurrentOrganizationId(organizations[0]?.id || null);
    }
  }, [organizations, currentOrganizationId]);

  const switchOrganization = (organizationId: number) => {
    const organization = organizations.find((org) => org.id === organizationId);
    if (organization) {
      setCurrentOrganizationId(organizationId);
    }
  };

  const clearOrganization = () => {
    setCurrentOrganizationId(null);
  };

  const contextValue: OrganizationContextType = {
    currentOrganization: safeCurrentOrganization,
    organizations,
    isLoading,
    error: error as Error | null,
    switchOrganization,
    clearOrganization,
    refetch,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}

// Higher-order component to protect routes that require organization context
export function withOrganization<P extends object>(
  Component: React.ComponentType<P>
) {
  return function OrganizationProtectedComponent(props: P) {
    const { currentOrganization, isLoading } = useOrganization();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading organization...</span>
        </div>
      );
    }

    if (!currentOrganization) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">No Organization Selected</h1>
            <p className="text-muted-foreground mb-4">
              Please select an organization to continue.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}