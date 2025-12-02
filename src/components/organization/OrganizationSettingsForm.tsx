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
import { TimezoneSelector } from "./TimezoneSelector";
import { Loader2, Building, Save } from "lucide-react";
import { useOrganization } from "~/lib/organization/context";

// Form validation schema
const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(256),
  description: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required").max(50),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface OrganizationSettingsFormProps {
  organizationId: number;
  onSuccess?: () => void;
}

export function OrganizationSettingsForm({
  organizationId,
  onSuccess,
}: OrganizationSettingsFormProps) {
  const { refetch: refetchOrganizations } = useOrganization();
  const { data: organization, isLoading: isLoadingOrg } = api.organization.getById.useQuery({
    id: organizationId,
  });

  const updateMutation = api.organization.update.useMutation({
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error.message ?? "Failed to update organization",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });

      // Refetch organizations list to show updated data
      refetchOrganizations();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message ?? "Failed to update organization",
        variant: "destructive",
      });
    },
  });

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: organization?.success ? organization.data.name : "",
      description: organization?.success ? organization.data.description || "" : "",
      timezone: organization?.success ? organization.data.timezone : "UTC",
    },
    values: {
      name: organization?.success ? organization.data.name : "",
      description: organization?.success ? organization.data.description || "" : "",
      timezone: organization?.success ? organization.data.timezone : "UTC",
    },
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    const result = await updateMutation.mutateAsync({
      id: organizationId,
      ...data,
    });

    if (result.success) {
      // Form will reset automatically via the useEffect dependency on organization data
      return;
    }

    toast({
      title: "Error",
      description: result.error.message || "Failed to update organization",
      variant: "destructive",
    });
  };

  if (isLoadingOrg) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading organization...</span>
        </CardContent>
      </Card>
    );
  }

  if (!organization?.success) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-destructive">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Organization not found or you don't have permission to edit it</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Organization Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter organization name"
              disabled={updateMutation.isPending}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="Brief description of your organization"
              disabled={updateMutation.isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <TimezoneSelector
            value={form.watch("timezone")}
            onChange={(timezone) => form.setValue("timezone", timezone)}
            disabled={updateMutation.isPending}
          />

          {form.formState.errors.timezone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.timezone.message}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !form.formState.isDirty}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}