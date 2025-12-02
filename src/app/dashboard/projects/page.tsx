"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Navigation } from "~/components/navigation/Navigation";
import { ProjectList } from "~/components/projects/ProjectList";
import { ProjectCreationForm } from "~/components/projects/ProjectCreationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { toast } from "~/components/ui/toast/use-toast";
import { Plus, Folder, Calendar, Users } from "lucide-react";
import { useOrganization } from "~/lib/organization/context";

export default function ProjectsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentOrganization } = useOrganization();

  const handleProjectCreated = () => {
    setShowCreateDialog(false);
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Success",
      description: "Project created successfully",
    });
  };

  const handleProjectSelect = (projectId: number) => {
    // Navigate to project-specific dashboard
    window.location.href = `/dashboard/projects/${projectId}`;
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
                  Please select an organization to manage projects
                </p>
                <Link href="/dashboard/organizations">
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Projects
              </h1>
              <p className="text-muted-foreground">
                Manage projects for {currentOrganization.name}
              </p>
            </div>

            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Projects List */}
          <ProjectList
            organizationId={currentOrganization.id}
            onProjectSelect={handleProjectSelect}
            onProjectCreate={() => setShowCreateDialog(true)}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectCreationForm
            onSuccess={handleProjectCreated}
            defaultOrganizationId={currentOrganization.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}