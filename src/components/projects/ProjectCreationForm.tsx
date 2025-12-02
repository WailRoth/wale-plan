"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { toast } from "~/components/ui/toast/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Loader2, Plus, Calendar, Clock } from "lucide-react";
import { useOrganization } from "~/lib/organization/context";

// Form validation schema
const projectFormSchema = z.object({
  organizationId: z.number().min(1, "Organization is required"),
  name: z.string().min(1, "Project name is required").max(256),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "completed", "archived"]).default("planning"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  workingDays: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .min(1, "At least one working day is required")
    .max(7, "Cannot have more than 7 working days"),
  workingHours: z.record(z.string(), z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  })),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectCreationFormProps {
  onSuccess?: () => void;
  defaultOrganizationId?: number;
}

const workingDaysOptions = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

const projectStatuses = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const defaultWorkingHours = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "17:00" },
  wednesday: { start: "09:00", end: "17:00" },
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
  saturday: { start: "09:00", end: "17:00" },
  sunday: { start: "09:00", end: "17:00" },
};

export function ProjectCreationForm({
  onSuccess,
  defaultOrganizationId,
}: ProjectCreationFormProps) {
  const { data: organizations } = api.organization.getUserOrganizations.useQuery();
  const { refetch: refetchProjects } = api.projects.getUserProjects.useQuery();

  const createMutation = api.projects.create.useMutation({
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error.message ?? "Failed to create project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      // Refetch projects list to show new project
      refetchProjects();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message ?? "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      organizationId: defaultOrganizationId || (organizations?.success ? organizations.data[0]?.organizationId : 0),
      name: "",
      description: "",
      status: "planning",
      workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      workingHours: defaultWorkingHours,
    },
  });

  const workingDays = form.watch("workingDays");
  const workingHours = form.watch("workingHours");

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    const currentDays = form.getValues("workingDays");
    if (checked) {
      form.setValue("workingDays", [...currentDays, dayId]);
    } else {
      form.setValue("workingDays", currentDays.filter(d => d !== dayId));
    }
  };

  const handleWorkingHoursChange = (dayId: string, field: "start" | "end", value: string) => {
    const currentHours = form.getValues("workingHours");
    form.setValue("workingHours", {
      ...currentHours,
      [dayId.toLowerCase()]: {
        ...currentHours[dayId.toLowerCase()],
        [field]: value,
      },
    });
  };

  const onSubmit = async (data: ProjectFormValues) => {
    const result = await createMutation.mutateAsync(data);

    if (result.success) {
      form.reset();
      return;
    }

    toast({
      title: "Error",
      description: result.error.message || "Failed to create project",
      variant: "destructive",
    });
  };

  const selectedOrgId = form.watch("organizationId");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Organization Selection */}
          <div className="space-y-2">
            <Label htmlFor="organizationId">Organization</Label>
            <Select
              value={selectedOrgId?.toString()}
              onValueChange={(value) => form.setValue("organizationId", parseInt(value))}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations?.success && organizations.data.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.organizationId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.organizationId.message}
              </p>
            )}
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter project name"
              disabled={createMutation.isPending}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Brief description of the project"
              disabled={createMutation.isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as any)}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {projectStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-destructive">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          {/* Working Days */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label>Working Days</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {workingDaysOptions.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={workingDays.includes(day.id)}
                    onCheckedChange={(checked) => handleWorkingDayChange(day.id, checked as boolean)}
                    disabled={createMutation.isPending}
                  />
                  <Label htmlFor={`day-${day.id}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.workingDays && (
              <p className="text-sm text-destructive">
                {form.formState.errors.workingDays.message}
              </p>
            )}
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label>Working Hours</Label>
            </div>
            <div className="space-y-2">
              {workingDays.map((day) => {
                const dayKey = day.toLowerCase();
                const dayHours = workingHours[dayKey];
                const dayLabel = workingDaysOptions.find(d => d.id === day)?.label || day;

                return (
                  <div key={day} className="flex items-center gap-2">
                    <Label className="w-20 text-sm">{dayLabel}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={dayHours?.start || "09:00"}
                        onChange={(e) => handleWorkingHoursChange(day, "start", e.target.value)}
                        disabled={createMutation.isPending}
                        className="w-24"
                      />
                      <span className="text-sm">to</span>
                      <Input
                        type="time"
                        value={dayHours?.end || "17:00"}
                        onChange={(e) => handleWorkingHoursChange(day, "end", e.target.value)}
                        disabled={createMutation.isPending}
                        className="w-24"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {form.formState.errors.workingHours && (
              <p className="text-sm text-destructive">
                {form.formState.errors.workingHours.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createMutation.isPending || !form.formState.isValid}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}