"use client";

import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { toast } from "~/components/ui/toast/use-toast";
import { ExceptionForm } from "./ExceptionForm";
import {
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Home,
  Plane,
  Settings,
  Coffee,
  AlertTriangle
} from "lucide-react";
import type { ResourceAvailabilityException } from "~/lib/validations/resourceAvailabilityExceptions";

interface ExceptionListProps {
  resourceId: number;
  currency?: string;
  className?: string;
}

// Exception type configuration
const exceptionTypeConfig = {
  holiday: { label: 'Holiday', icon: Home, color: 'bg-red-100 text-red-800', borderColor: 'border-red-200' },
  vacation: { label: 'Vacation', icon: Plane, color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-200' },
  custom: { label: 'Custom', icon: Settings, color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-200' },
  'non-working': { label: 'Non-working', icon: Coffee, color: 'bg-orange-100 text-orange-800', borderColor: 'border-orange-200' },
} as const;

export function ExceptionList({ resourceId, currency = "USD", className }: ExceptionListProps) {
  const [editingException, setEditingException] = useState<ResourceAvailabilityException | null>(null);

  // tRPC queries and mutations
  const {
    data: exceptionsData,
    isLoading,
    error,
    refetch,
  } = api.resourceAvailabilityExceptions.getByResourceId.useQuery(
    { resourceId },
    {
      enabled: !!resourceId,
      refetchOnWindowFocus: false,
    }
  );

  const deleteException = api.resourceAvailabilityExceptions.delete.useMutation();
  const updateException = api.resourceAvailabilityExceptions.update.useMutation();

  const exceptions = exceptionsData?.success ? exceptionsData.data.exceptions : [];

  // Handle exception deletion
  const handleDelete = async (exception: ResourceAvailabilityException) => {
    if (!window.confirm(`Are you sure you want to delete the exception for ${exception.exceptionDate}?`)) {
      return;
    }

    try {
      const result = await deleteException.mutateAsync({ id: exception.id });
      if (result.success) {
        toast({
          title: "Success",
          description: `Exception for ${exception.exceptionDate} deleted successfully`,
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete exception",
        variant: "destructive",
      });
    }
  };

  // Handle active toggle
  const handleToggleActive = async (exception: ResourceAvailabilityException) => {
    try {
      const result = await updateException.mutateAsync({
        id: exception.id,
        isActive: !exception.isActive,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Exception ${exception.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast({
        title: "Error",
        description: "Failed to update exception status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (exception: ResourceAvailabilityException) => {
    setEditingException(exception);
  };

  const handleFormSuccess = () => {
    setEditingException(null);
    refetch();
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return 'All day';
    return time.substring(0, 5); // Remove seconds if present
  };

  const formatHours = (hours: string) => {
    const hoursNum = parseFloat(hours);
    if (hoursNum === 0) return 'Non-working';
    return `${hoursNum}h`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center min-h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Exceptions</h3>
            <p className="text-muted-foreground">
              {error.message || "Failed to load availability exceptions"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Availability Exceptions</h3>
          <p className="text-sm text-muted-foreground">
            Manage special dates that override weekly patterns
          </p>
        </div>
        <ExceptionForm
          resourceId={resourceId}
          currency={currency}
          onSuccess={handleFormSuccess}
        />
      </div>

      {/* Exceptions List */}
      {exceptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exceptions</h3>
              <p className="text-muted-foreground mb-4">
                No availability exceptions have been created for this resource.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Add Exception" to create one for holidays, vacations, or special events.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exceptions.map((exception) => {
            const typeConfig = exceptionTypeConfig[exception.exceptionType as keyof typeof exceptionTypeConfig];
            const TypeIcon = typeConfig.icon;

            return (
              <Card
                key={exception.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  exception.isActive ? '' : 'opacity-60'
                } ${typeConfig.borderColor}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    {/* Left side - Exception info */}
                    <div className="flex items-center space-x-4">
                      {/* Exception type icon and badge */}
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        <Badge className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                      </div>

                      {/* Exception details */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4">
                          {/* Date */}
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(exception.exceptionDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Time range */}
                          {exception.startTimeUtc && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatTime(exception.startTimeUtc)} - {formatTime(exception.endTimeUtc)}
                              </span>
                            </div>
                          )}

                          {/* Hours */}
                          <div className="flex items-center space-x-1 text-sm">
                            <span className={`font-medium ${
                              parseFloat(exception.hoursAvailable) === 0 ? 'text-red-600' : ''
                            }`}>
                              {formatHours(exception.hoursAvailable)}
                            </span>
                          </div>

                          {/* Rate */}
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-mono">
                              {parseFloat(exception.hourlyRate).toFixed(2)} {exception.currency}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {exception.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {exception.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Active toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(exception)}
                        className="h-8 px-2"
                      >
                        {exception.isActive ? (
                          <Power className="h-4 w-4 text-green-600" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(exception)}
                        className="h-8 px-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(exception)}
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit form modal */}
      {editingException && (
        <ExceptionForm
          resourceId={resourceId}
          currency={currency}
          onSuccess={handleFormSuccess}
          mode="edit"
          exceptionId={editingException.id}
          initialData={{
            exceptionDate: editingException.exceptionDate,
            startTimeUtc: editingException.startTimeUtc || undefined,
            endTimeUtc: editingException.endTimeUtc || undefined,
            hoursAvailable: parseFloat(editingException.hoursAvailable),
            hourlyRate: parseFloat(editingException.hourlyRate),
            currency: editingException.currency,
            isActive: editingException.isActive,
            exceptionType: editingException.exceptionType as "custom" | "holiday" | "vacation" | "non-working",
            notes: editingException.notes || undefined,
          }}
          trigger={null} // Controlled mode
        />
      )}
    </div>
  );
}

// Export a memoized version
export const MemoizedExceptionList = React.memo(ExceptionList);