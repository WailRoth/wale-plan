"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { toast } from "~/components/ui/toast/use-toast";
import {
  Loader2,
  Folder,
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface ProjectListProps {
  organizationId?: number;
  onProjectSelect?: (projectId: number) => void;
  onProjectEdit?: (projectId: number) => void;
  refreshTrigger?: number;
}

const statusConfig = {
  planning: { label: "Planning", color: "default" as const },
  active: { label: "Active", color: "default" as const },
  completed: { label: "Completed", color: "secondary" as const },
  archived: { label: "Archived", color: "outline" as const },
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString();
}

export function ProjectList({
  organizationId,
  onProjectSelect,
  onProjectEdit,
  refreshTrigger,
}: ProjectListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const { data: projects, isLoading, refetch } = organizationId
    ? api.projects.getOrganizationProjects.useQuery({ organizationId })
    : api.projects.getUserProjects.useQuery();

  const deleteMutation = api.projects.delete.useMutation({
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error.message ?? "Failed to delete project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message ?? "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  // Refetch when refreshTrigger changes
  if (refreshTrigger) {
    refetch();
  }

  const handleDeleteProject = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteMutation.mutateAsync({ id: projectToDelete });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </CardContent>
      </Card>
    );
  }

  if (!projects?.success || projects.data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects found</p>
            <p className="text-sm mt-2">Create your first project to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const projectData = projects.data;

  return (
    <>
      <div className="space-y-4">
        {projectData.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className="text-lg font-semibold truncate cursor-pointer hover:text-primary"
                      onClick={() => onProjectSelect?.(project.id)}
                    >
                      {project.name}
                    </h3>
                    <Badge variant={statusConfig[project.status as keyof typeof statusConfig].color}>
                      {statusConfig[project.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>End: {formatDate(project.endDate)}</span>
                    </div>
                    {"organizationName" in project && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.organizationName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onProjectSelect?.(project.id)}>
                      <Folder className="mr-2 h-4 w-4" />
                      View Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onProjectEdit?.(project.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone
              and will also delete all associated tasks, resources, and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}