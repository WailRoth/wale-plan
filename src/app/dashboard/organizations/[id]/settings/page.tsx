"use client";

import React from "react";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Navigation } from "~/components/navigation/Navigation";
import { TRPCReactProvider } from "~/trpc/react";
import { OrganizationProvider, useOrganization } from "~/lib/organization/context";
import { OrganizationSettingsForm } from "~/components/organization/OrganizationSettingsForm";
import { ArrowLeft, Building, AlertCircle } from "lucide-react";
import Link from "next/link";

interface OrganizationSettingsPageProps {
  params: Promise<{ id: string }>;
}

function OrganizationSettingsContent({ organizationId }: { organizationId: number }) {
  const { organizations, currentOrganization } = useOrganization();

  // Check if user has access to this organization
  const hasAccess = organizations.some(org => org.id === organizationId);
  const currentOrg = organizations.find(org => org.id === organizationId);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have access to this organization or the organization doesn't exist.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/dashboard/organizations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Organizations
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-muted-foreground" />
                <h1 className="text-3xl font-bold tracking-tight">
                  {currentOrg?.name} Settings
                </h1>
              </div>
              <p className="text-muted-foreground">
                Manage your organization details and preferences
              </p>
            </div>
          </div>

          {/* Organization Info */}
          {currentOrg && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Current role: <span className="font-medium capitalize">{currentOrg.role}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Organization ID</div>
                    <div className="text-muted-foreground">#{currentOrg.id}</div>
                  </div>
                  <div>
                    <div className="font-medium">Name</div>
                    <div className="text-muted-foreground">{currentOrg.name}</div>
                  </div>
                  <div>
                    <div className="font-medium">Timezone</div>
                    <div className="text-muted-foreground">{currentOrg.timezone}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Form */}
          <OrganizationSettingsForm
            organizationId={organizationId}
            onSuccess={() => {
              // You could add a success message here
            }}
          />

          {/* Danger Zone */}
          {currentOrg?.role === 'owner' && (
            <Card className="mt-6 border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-900">Danger Zone</CardTitle>
                <CardDescription className="text-red-800">
                  Irreversible actions that affect your entire organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-red-800">
                  <strong>Note:</strong> Organization deletion and member management features are coming soon.
                  For now, please contact support if you need to make changes to your organization membership.
                </div>
                <Button variant="outline" disabled className="text-red-700 border-red-300">
                  Delete Organization (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Permissions Info */}
          <Card className="mt-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Building className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Organization Permissions
                  </h3>
                  <div className="text-sm text-blue-800 mt-1">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Owner:</strong> Full access to all settings and member management</li>
                      <li><strong>Admin:</strong> Can manage projects and team members</li>
                      <li><strong>Member:</strong> Can view and work on assigned projects</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with providers
export default function OrganizationSettingsPage({ params }: OrganizationSettingsPageProps) {
  const [organizationId, setOrganizationId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const getOrganizationId = async () => {
      const { id } = await params;
      const orgId = parseInt(id, 10);

      if (isNaN(orgId)) {
        notFound();
      }

      setOrganizationId(orgId);
    };

    getOrganizationId();
  }, [params]);

  if (organizationId === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TRPCReactProvider>
      <OrganizationProvider>
        <OrganizationSettingsContent organizationId={organizationId} />
      </OrganizationProvider>
    </TRPCReactProvider>
  );
}