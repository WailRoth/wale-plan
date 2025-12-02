"use client";

import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Navigation } from "~/components/navigation/Navigation";
import { auth } from "~/lib/auth/config";
import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/trpc/react";
import { OrganizationProvider, useOrganization } from "~/lib/organization/context";
import { OrganizationDisplay } from "~/components/organization/OrganizationDisplay";
import { Building, Plus, Users, Settings } from "lucide-react";

function OrganizationsList() {
  const { organizations, isLoading, currentOrganization, switchOrganization } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading organizations...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
              <p className="text-muted-foreground">
                Manage your organizations and workspace settings
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard/organizations/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </Link>
            </div>
          </div>

          {organizations.length === 0 ? (
            // Empty State
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first organization to start managing projects with your team.
                </p>
                <Link href="/dashboard/organizations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Organization
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Current Organization */}
              {currentOrganization && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Current Organization</h2>
                  <OrganizationDisplay
                    organization={currentOrganization}
                    userOrganizations={organizations}
                    currentOrganizationId={currentOrganization.id}
                    onOrganizationChange={switchOrganization}
                    onEdit={() => redirect(`/dashboard/organizations/${currentOrganization.id}/settings`)}
                  />
                </div>
              )}

              {/* All Organizations */}
              <div>
                <h2 className="text-xl font-semibold mb-4">All Organizations</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {organizations.map((org) => (
                    <Card key={org.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{org.name}</CardTitle>
                          </div>
                          <Badge variant={org.role === 'owner' ? 'default' : 'secondary'}>
                            {org.role}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>Timezone: {org.timezone}</span>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Current time: {new Date().toLocaleTimeString('en-US', {
                              timeZone: org.timezone,
                              hour12: false
                            })}
                          </div>

                          {org.id === currentOrganization?.id && (
                            <div className="text-sm text-green-600 font-medium">
                              ✓ Currently active
                            </div>
                          )}

                          <div className="flex space-x-2">
                            {org.id !== currentOrganization?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => switchOrganization(org.id)}
                                className="flex-1"
                              >
                                Switch to this org
                              </Button>
                            )}
                            <Link href={`/dashboard/organizations/${org.id}/settings`}>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Building className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">
                        Organization Management Tips
                      </h3>
                      <div className="text-sm text-blue-800">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Switch between organizations using the "Switch to this org" button</li>
                          <li>Click the settings icon to edit organization details</li>
                          <li>Create new organizations for different teams or clients</li>
                          <li>Each organization has its own projects and resources</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper component with providers
export default function OrganizationsPage() {
  return (
    <TRPCReactProvider>
      <OrganizationProvider>
        <OrganizationsList />
      </OrganizationProvider>
    </TRPCReactProvider>
  );
}