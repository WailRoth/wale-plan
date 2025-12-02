"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { toast } from "~/components/ui/toast/use-toast";
import {
  Folder,
  ChevronDown,
  Plus,
  Settings,
  Users,
} from "lucide-react";

interface ProjectNavigationProps {
  currentProjectId?: number;
  onProjectChange?: (projectId: number) => void;
  onProjectCreate?: () => void;
  showCreateButton?: boolean;
  organizationId?: number;
}

export function ProjectNavigation({
  currentProjectId,
  onProjectChange,
  onProjectCreate,
  showCreateButton = true,
  organizationId,
}: ProjectNavigationProps) {
  const [mounted, setMounted] = useState(false);

  const { data: projects, isLoading } = organizationId
    ? api.projects.getOrganizationProjects.useQuery({ organizationId })
    : api.projects.getUserProjects.useQuery();

  // Fix hydration issues with localStorage/state
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-40 bg-muted animate-pulse rounded" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!projects?.success || projects.data.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled>
          <Folder className="mr-2 h-4 w-4" />
          No Projects
        </Button>
        {showCreateButton && (
          <Button size="sm" onClick={onProjectCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        )}
      </div>
    );
  }

  const currentProject = projects.data.find(p => p.id === currentProjectId);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[200px]">
            <div className="flex items-center gap-2 truncate">
              <Folder className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {currentProject ? currentProject.name : "Select Project"}
              </span>
              {currentProject && (
                <Badge variant="secondary" className="ml-1 shrink-0">
                  {currentProject.status}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[250px]">
          {currentProject && (
            <>
              <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
                Current Project
              </div>
              <DropdownMenuItem
                className="font-medium"
                onClick={() => onProjectChange?.(currentProject.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{currentProject.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Status: {currentProject.status}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Switch Project
          </div>
          {projects.data
            .filter(p => p.id !== currentProjectId)
            .map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onProjectChange?.(project.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {"organizationName" in project ? project.organizationName : `Status: ${project.status}`}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

          {showCreateButton && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProjectCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showCreateButton && (
        <Button size="sm" onClick={onProjectCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      )}
    </div>
  );
}

// Compact version for smaller spaces
interface CompactProjectNavigationProps {
  currentProjectId?: number;
  onProjectChange?: (projectId: number) => void;
  organizationId?: number;
}

export function CompactProjectNavigation({
  currentProjectId,
  onProjectChange,
  organizationId,
}: CompactProjectNavigationProps) {
  const [mounted, setMounted] = useState(false);

  const { data: projects, isLoading } = organizationId
    ? api.projects.getOrganizationProjects.useQuery({ organizationId })
    : api.projects.getUserProjects.useQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <div className="h-10 w-40 bg-muted animate-pulse rounded" />;
  }

  if (!projects?.success || projects.data.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="No projects available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={currentProjectId?.toString()}
      onValueChange={(value) => onProjectChange?.(parseInt(value))}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select project">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            {currentProjectId
              ? projects.data.find(p => p.id === currentProjectId)?.name
              : "Select project"}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {projects.data.map((project) => (
          <SelectItem key={project.id} value={project.id.toString()}>
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <div className="flex-1">
                <div>{project.name}</div>
                {"organizationName" in project && (
                  <div className="text-xs text-muted-foreground">
                    {project.organizationName}
                  </div>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}