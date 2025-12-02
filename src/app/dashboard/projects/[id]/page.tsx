"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Navigation } from "~/components/navigation/Navigation";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { ArrowLeft, Folder, Calendar, Users, Settings } from "lucide-react";
import { useOrganization } from "~/lib/organization/context";
import { toast } from "~/components/ui/toast/use-toast";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { currentOrganization } = useOrganization();
  const projectId = parseInt(params.id);

  const { data: project, isLoading } = api.projects.getById.useQuery({
    id: projectId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4 w-64"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project?.success) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Folder className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  The project you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Link href="/dashboard/projects">
                  <Button>
                    Back to Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const projectData = project.data;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {projectData.name}
                </h1>
                <Badge variant={projectData.status === "active" ? "default" : "secondary"}>
                  {projectData.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {currentOrganization?.name}
              </p>
            </div>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>

          {/* Project Info */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Basic information about this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectData.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {projectData.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Start Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {projectData.startDate
                          ? new Date(projectData.startDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">End Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {projectData.endDate
                          ? new Date(projectData.endDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    Project tasks and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      <p className="mb-4">Tasks management coming soon</p>
                      <p className="text-sm">
                        You'll be able to create tasks, set dependencies, and track progress here.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Calendar Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendar Settings
                  </CardTitle>
                  <CardDescription>
                    Project working days and hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Working Days</h4>
                      <div className="flex flex-wrap gap-2">
                        {projectData.workingDays?.map((day) => (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {day}
                          </Badge>
                        )) || (
                          <p className="text-sm text-muted-foreground">No working days set</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Working Hours</h4>
                      <div className="space-y-2 text-sm">
                        {projectData.workingHours ? (
                          Object.entries(projectData.workingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}</span>
                              <span className="text-muted-foreground">
                                {hours.start} - {hours.end}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No working hours set</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Resources
                  </CardTitle>
                  <CardDescription>
                    Team members and resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">
                      <p className="mb-4">Resource management coming soon</p>
                      <p className="text-sm">
                        You'll be able to assign team members and manage resources here.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}