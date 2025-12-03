"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "~/components/ui/toast/use-toast";
import {
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Edit2,
  Loader2,
  X,
  AlertTriangle,
  Coffee,
  Plane,
  Home,
  Settings
} from "lucide-react";

// Import validation schemas
import {
  createExceptionSchema,
  updateExceptionSchema,
  type CreateExceptionInput,
  type ResourceAvailabilityException
} from "~/lib/validations/resourceAvailabilityExceptions";

interface ExceptionFormProps {
  resourceId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  mode?: "create" | "edit";
  initialData?: Partial<Omit<ResourceAvailabilityException, 'hoursAvailable' | 'hourlyRate'> & {
    hoursAvailable?: number;
    hourlyRate?: number;
  }>;
  exceptionId?: string;
  currency?: string;
}

// Exception type options with icons
const exceptionTypes = [
  { value: 'holiday', label: 'Holiday', icon: Home, color: 'text-red-600' },
  { value: 'vacation', label: 'Vacation', icon: Plane, color: 'text-blue-600' },
  { value: 'custom', label: 'Custom', icon: Settings, color: 'text-gray-600' },
  { value: 'non-working', label: 'Non-working', icon: Coffee, color: 'text-orange-600' },
] as const;

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export function ExceptionForm({
  resourceId,
  onSuccess,
  trigger,
  mode = "create",
  initialData,
  exceptionId,
  currency = "USD",
}: ExceptionFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC mutations
  const createException = api.resourceAvailabilityExceptions.create.useMutation();
  const updateException = api.resourceAvailabilityExceptions.update.useMutation();

  // Create a form schema that works for both modes
  const formSchema = mode === "create"
    ? createExceptionSchema
    : updateExceptionSchema;

  const form = useForm<ExceptionFormData>({
    resolver: zodResolver(formSchema as any),
    defaultValues: mode === "create" ? {
      resourceId,
      exceptionDate: initialData?.exceptionDate || "",
      startTimeUtc: initialData?.startTimeUtc || "",
      endTimeUtc: initialData?.endTimeUtc || "",
      hoursAvailable: initialData?.hoursAvailable ?? 8,
      hourlyRate: initialData?.hourlyRate ?? 50,
      currency: initialData?.currency || currency,
      isActive: initialData?.isActive ?? true,
      exceptionType: (initialData?.exceptionType as "custom" | "holiday" | "vacation" | "non-working") || "custom",
      notes: initialData?.notes || "",
    } : {
      id: exceptionId || "",
      exceptionDate: initialData?.exceptionDate || "",
      startTimeUtc: initialData?.startTimeUtc || "",
      endTimeUtc: initialData?.endTimeUtc || "",
      hoursAvailable: initialData?.hoursAvailable ?? 8,
      hourlyRate: initialData?.hourlyRate ?? 50,
      currency: initialData?.currency || currency,
      isActive: initialData?.isActive ?? true,
      exceptionType: (initialData?.exceptionType as "custom" | "holiday" | "vacation" | "non-working") || "custom",
      notes: initialData?.notes || "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = form;

  const hoursAvailable = watch("hoursAvailable");
  const exceptionType = watch("exceptionType");
  const isActive = watch("isActive");

  // Auto-set exception type to 'non-working' when hoursAvailable is 0
  React.useEffect(() => {
    if (hoursAvailable === 0 && exceptionType !== 'non-working') {
      setValue("exceptionType", "non-working");
    } else if (hoursAvailable > 0 && exceptionType === 'non-working') {
      // If hours are set to >0, change exception type from non-working
      setValue("exceptionType", "custom");
    }
  }, [hoursAvailable, exceptionType, setValue]);

  // Create unified form type for both modes
type ExceptionFormData = {
  // Common fields
  exceptionDate: string;
  startTimeUtc?: string;
  endTimeUtc?: string;
  hoursAvailable: number;
  hourlyRate: number;
  currency: string;
  isActive: boolean;
  exceptionType: "custom" | "holiday" | "vacation" | "non-working";
  notes?: string;
  // Create-only field
  resourceId?: number;
  // Update-only field
  id?: string;
};

  const onSubmit = async (data: ExceptionFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const result = await createException.mutateAsync(data as CreateExceptionInput);
        if (result.success) {
          toast({
            title: "Success",
            description: `Exception for ${result.data.exceptionDate} created successfully`,
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
      } else if (mode === "edit" && exceptionId) {
        const updateData = {
          id: exceptionId,
          ...data,
        };
        const result = await updateException.mutateAsync(updateData);
        if (result.success) {
          toast({
            title: "Success",
            description: `Exception for ${result.data.exceptionDate} updated successfully`,
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
      console.error("Exception form submission error:", error);
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
      Add Exception
    </Button>
  );

  const getExceptionTypeIcon = (type: string) => {
    const exceptionType = exceptionTypes.find(t => t.value === type);
    const Icon = exceptionType?.icon || Settings;
    return <Icon className={`mr-2 h-4 w-4 ${exceptionType?.color}`} />;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Availability Exception" : "Edit Availability Exception"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Exception Date */}
          <div className="space-y-2">
            <Label htmlFor="exceptionDate" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Exception Date *
            </Label>
            <Input
              id="exceptionDate"
              type="date"
              {...register("exceptionDate")}
              className={errors.exceptionDate ? "border-red-500" : ""}
            />
            {errors.exceptionDate && (
              <p className="text-sm text-red-500">{typeof errors.exceptionDate.message === 'string' ? errors.exceptionDate.message : 'Invalid date'}</p>
            )}
          </div>

          {/* Exception Type */}
          <div className="space-y-2">
            <Label htmlFor="exceptionType">Exception Type *</Label>
            <Select
              value={exceptionType}
              onValueChange={(value) => setValue("exceptionType", value as any)}
            >
              <SelectTrigger className={errors.exceptionType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select exception type">
                  {exceptionType && getExceptionTypeIcon(exceptionType)}
                  {exceptionTypes.find(t => t.value === exceptionType)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {exceptionTypes.map(({ value, label, icon: Icon, color }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center">
                      <Icon className={`mr-2 h-4 w-4 ${color}`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.exceptionType && (
              <p className="text-sm text-red-500">{typeof errors.exceptionType.message === 'string' ? errors.exceptionType.message : 'Invalid exception type'}</p>
            )}
            {hoursAvailable === 0 && (
              <div className="flex items-center text-sm text-orange-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Exception type automatically set to "Non-working" when hours available is 0
              </div>
            )}
          </div>

          {/* Time Range (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTimeUtc" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Start Time (UTC)
              </Label>
              <Input
                id="startTimeUtc"
                type="time"
                {...register("startTimeUtc")}
                placeholder="09:00"
                className={errors.startTimeUtc ? "border-red-500" : ""}
              />
              {errors.startTimeUtc && (
                <p className="text-sm text-red-500">{errors.startTimeUtc.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTimeUtc" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                End Time (UTC)
              </Label>
              <Input
                id="endTimeUtc"
                type="time"
                {...register("endTimeUtc")}
                placeholder="17:00"
                className={errors.endTimeUtc ? "border-red-500" : ""}
              />
              {errors.endTimeUtc && (
                <p className="text-sm text-red-500">{errors.endTimeUtc.message}</p>
              )}
            </div>
          </div>

          {/* Hours Available and Hourly Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursAvailable">Hours Available *</Label>
              <Input
                id="hoursAvailable"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="8.0"
                className={errors.hoursAvailable ? "border-red-500" : ""}
                {...register("hoursAvailable", {
                  valueAsNumber: true,
                })}
              />
              {errors.hoursAvailable && (
                <p className="text-sm text-red-500">{errors.hoursAvailable.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate" className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Hourly Rate *
              </Label>
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
          </div>

          {/* Currency */}
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
                {currencyOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Add any additional notes about this exception..."
              {...register("notes")}
              className={errors.notes ? "border-red-500" : ""}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>

          {/* Active Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
            />
            <Label htmlFor="isActive" className="text-sm">
              Exception is active
            </Label>
          </div>
          {!isActive && (
            <p className="text-sm text-gray-500">
              Inactive exceptions will be ignored when calculating availability.
            </p>
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
                  {mode === "create" ? "Add Exception" : "Update Exception"}
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
export const MemoizedExceptionForm = React.memo(ExceptionForm);