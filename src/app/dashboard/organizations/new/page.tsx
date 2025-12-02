"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { TimezoneSelector } from "~/components/organization/TimezoneSelector";
import { Navigation } from "~/components/navigation/Navigation";
import { TRPCReactProvider } from "~/trpc/react";
import { api } from "~/trpc/react";
import { OrganizationProvider, useOrganization } from "~/lib/organization/context";
import { AlertCircle, Building } from "lucide-react";

function NewOrganizationPageContent() {
  const router = useRouter();
  const { refetch: refetchOrganizations } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    timezone: "UTC"
  });

  const createOrganization = api.organization.create.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        // Refetch the organizations list to show the new organization
        refetchOrganizations();
        router.push("/dashboard/organizations");
      } else {
        setError(result.error?.message || "Failed to create organization");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.name.trim()) {
      setError("Organization name is required");
      setIsLoading(false);
      return;
    }

    createOrganization.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      timezone: formData.timezone
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/organizations">
                <Button variant="ghost" className="font-medium">
                  ← Back to Organizations
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Create New Organization</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Set up your organization to start managing projects with your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    type="text"
                    placeholder="ACME Corporation"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    The name of your organization or company.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    type="text"
                    placeholder="acme-corp"
                    pattern="[a-z0-9-]+"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    A unique identifier for your organization (lowercase letters, numbers, and hyphens only).
                    If left empty, it will be auto-generated from the name.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="A brief description of your organization..."
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional description of your organization.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <TimezoneSelector
                    value={formData.timezone}
                    onChange={(value) => handleInputChange("timezone", value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    The timezone for your organization's scheduling and time tracking.
                  </p>
                </div>
              </div>

              <CardFooter className="flex justify-between px-0 pb-0">
                <Link href="/dashboard/organizations">
                  <Button variant="outline" type="button" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Organization"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex space-x-3">
              <Building className="h-6 w-6 text-blue-600 mt-1" />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-blue-900">
                  What happens next?
                </h3>
                <div className="text-sm text-blue-800">
                  <ul className="list-disc list-inside space-y-1">
                    <li>You&apos;ll be the owner of the new organization</li>
                    <li>You can invite team members via email invitations</li>
                    <li>You can create projects and manage resources</li>
                    <li>You can set up roles and permissions for team members</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrapper component with providers
export default function NewOrganizationPage() {
  return (
    <TRPCReactProvider>
      <OrganizationProvider>
        <NewOrganizationPageContent />
      </OrganizationProvider>
    </TRPCReactProvider>
  );
}