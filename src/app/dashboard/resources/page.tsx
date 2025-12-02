"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Navigation } from "~/components/navigation/Navigation";
import { ResourceTable } from "~/components/resources/ResourceTable";
import { useOrganization } from "~/lib/organization/context";
import { Users, Package } from "lucide-react";

export default function ResourcesPage() {
  const { currentOrganization } = useOrganization();

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Please select an organization to manage resources
                </p>
                <a href="/dashboard/organizations" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  Go to Organizations
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">
                Resources
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage resources for {currentOrganization.name}
            </p>
          </div>

          {/* Resources Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Resources</CardTitle>
              <CardDescription>
                Manage your team members, materials, and equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceTable organizationId={currentOrganization.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}