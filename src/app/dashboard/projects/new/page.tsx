"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Navigation } from "~/components/navigation/Navigation";
import { ProjectCreationForm } from "~/components/projects/ProjectCreationForm";
import { toast } from "~/components/ui/toast/use-toast";
import { ArrowLeft, Plus, Folder } from "lucide-react";
import { useOrganization } from "~/lib/organization/context";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const { currentOrganization } = useOrganization();

  const handleProjectCreated = () => {
    toast({
      title: "Success",
      description: "Project created successfully",
    });
    // Redirect to the projects list
    router.push("/dashboard/projects");
  };

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Folder className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Please select an organization to create a project
                </p>
                <Link href="/dashboard/organizations">
                  <Button>
                    Go to Organizations
                  </Button>
                </Link>
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

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/projects">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Create New Project
              </h1>
              <p className="text-muted-foreground">
                for {currentOrganization.name}
              </p>
            </div>
          </div>

          {/* Project Creation Form */}
          <ProjectCreationForm
            onSuccess={handleProjectCreated}
            defaultOrganizationId={currentOrganization.id}
          />
        </div>
      </div>
    </div>
  );
}