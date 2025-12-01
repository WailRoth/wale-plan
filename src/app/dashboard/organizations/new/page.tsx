import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

import { authClient } from "~/server/better-auth/client";
import { getSession } from "~/server/better-auth/server";

export default async function NewOrganizationPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="font-medium">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Create New Organization</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Set up your organization to start managing projects with your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              action={async (formData: FormData) => {
                "use server";

                const name = formData.get("name") as string;
                const slug = formData.get("slug") as string;

                try {
                  await authClient.organization.create({
                    name,
                    slug,
                  });

                  redirect("/dashboard");
                } catch (error) {
                  // Handle error - in a real app, you'd want to show this to the user
                  console.error("Failed to create organization:", error);
                  // For now, we'll just redirect to dashboard even on error
                  redirect("/dashboard");
                }
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="ACME Corporation"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    The name of your organization or company.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Organization Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    placeholder="acme-corp"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    A unique identifier for your organization (lowercase letters, numbers, and hyphens only).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="A brief description of your organization..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional description of your organization.
                  </p>
                </div>
              </div>

              <CardFooter className="flex justify-between px-0 pb-0">
                <Link href="/dashboard">
                  <Button variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">
                  Create Organization
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex">
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