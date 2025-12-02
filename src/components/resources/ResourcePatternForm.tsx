"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "~/components/ui/toast/use-toast";
import { User, Package, Wrench, Plus, Edit2, Loader2, X } from "lucide-react";

// Import validation schemas
import { createResourceSchema, type CreateResourceInput } from "~/lib/validations/resource";
import type { ResourceType } from "~/lib/types/resource";

// Extend the schema for the form
const resourceFormSchema = createResourceSchema.extend({
  organizationId: z.number().min(1, "Organization ID is required"),
  dailyWorkHours: z.number().min(0.1, "Daily work hours must be positive").max(24, "Daily work hours cannot exceed 24").default(8.0),
  currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
});

type ResourceFormData = z.infer<typeof resourceFormSchema>;

interface ResourcePatternFormProps {
  organizationId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  mode?: "create" | "edit";
  initialData?: Partial<CreateResourceInput>;
  resourceId?: number;
}

export function ResourcePatternForm({
  organizationId,
  onSuccess,
  trigger,
  mode = "create",
  initialData,
  resourceId,
}: ResourcePatternFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC mutations
  const createResource = api.resources.create.useMutation();
  const updateResource = api.resources.update.useMutation();

  const form = useForm({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      organizationId,
      name: initialData?.name || "",
      type: initialData?.type || "human",
      hourlyRate: initialData?.hourlyRate || 50,
      dailyWorkHours: initialData?.dailyWorkHours || 8,
      currency: initialData?.currency || "USD",
      userId: initialData?.userId,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const selectedType = watch("type");

  const onSubmit = async (data: ResourceFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const result = await createResource.mutateAsync(data);
        if (result.success) {
          toast({
            title: "Success",
            description: `Resource "${result.data.name}" created successfully`,
          });
          reset();
          setOpen(false);
          onSuccess?.();
        } else {
          toast({
            title: "Error",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else if (mode === "edit" && resourceId) {
        const updateData = {
          id: resourceId,
          name: data.name,
          type: data.type,
          hourlyRate: data.hourlyRate,
          dailyWorkHours: data.dailyWorkHours,
          currency: data.currency,
          userId: data.userId,
        };
        const result = await updateResource.mutateAsync(updateData);
        if (result.success) {
          toast({
            title: "Success",
            description: `Resource "${result.data.name}" updated successfully`,
          });
          setOpen(false);
          onSuccess?.();
        } else {
          toast({
            title: "Error",
            description: result.error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Resource form submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    setOpen(newOpen);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Resource
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Resource" : "Edit Resource"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Resource Name</Label>
            <Input
              id="name"
              placeholder="e.g., Senior Developer, Designer, Equipment"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Resource Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value: ResourceType) => setValue("type", value)}
            >
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="human">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Human
                  </div>
                </SelectItem>
                <SelectItem value="material">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    Material
                  </div>
                </SelectItem>
                <SelectItem value="equipment">
                  <div className="flex items-center">
                    <Wrench className="mr-2 h-4 w-4" />
                    Equipment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="50.00"
                  className={`pl-7 ${errors.hourlyRate ? "border-red-500" : ""}`}
                  {...register("hourlyRate", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.hourlyRate && (
                <p className="text-sm text-red-500">{errors.hourlyRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyWorkHours">Daily Work Hours</Label>
              <Input
                id="dailyWorkHours"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                placeholder="8.0"
                className={errors.dailyWorkHours ? "border-red-500" : ""}
                {...register("dailyWorkHours", {
                  valueAsNumber: true,
                })}
              />
              {errors.dailyWorkHours && (
                <p className="text-sm text-red-500">{errors.dailyWorkHours.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={watch("currency")}
              onValueChange={(value) => setValue("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional: Link to user for human resources */}
          {selectedType === "human" && (
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm text-gray-600">
                User (Optional - Link to team member)
              </Label>
              <Input
                id="userId"
                placeholder="User ID or email"
                {...register("userId")}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <Plus className="mr-2 h-4 w-4" />
                  ) : (
                    <Edit2 className="mr-2 h-4 w-4" />
                  )}
                  {mode === "create" ? "Create Resource" : "Update Resource"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Export a memoized version to prevent unnecessary re-renders
export const MemoizedResourcePatternForm = React.memo(ResourcePatternForm);