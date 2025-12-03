"use client";

import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EditableTable } from "~/components/ui/tables";
import { ResourcePatternForm } from "./ResourcePatternForm";
import { ResourceTypeSelector } from "./ResourceTypeSelector";
import { api } from "~/trpc/react";
import { toast } from "~/components/ui/toast/use-toast";
import { Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import type { GetResourceResponse } from "~/lib/types/resource";

// Define EditableColumn interface for our use case
interface ResourceEditableColumn {
  header: string;
  accessorKey: keyof GetResourceResponse;
  editable?: boolean;
  type?: "text" | "number" | "select";
  options?: Array<{ value: any; label: string }>;
  cell?: (row: GetResourceResponse) => React.ReactNode;
  onSave?: (rowId: string | number, field: keyof GetResourceResponse, value: any) => Promise<void> | void;
}

interface ResourceTableProps {
  organizationId: number;
  className?: string;
}

export function ResourceTable({ organizationId, className }: ResourceTableProps) {
  const router = useRouter();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<GetResourceResponse | null>(null);

  // tRPC queries and mutations
  const {
    data: resourcesData,
    isLoading,
    error,
    refetch,
  } = api.resources.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const deleteResource = api.resources.delete.useMutation();

  const resources = resourcesData?.success ? resourcesData.data : [];

  // Handle resource deletion
  const handleDelete = async (resource: GetResourceResponse) => {
    if (!window.confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      return;
    }

    try {
      const result = await deleteResource.mutateAsync({ id: resource.id });
      if (result.success) {
        toast({
          title: "Success",
          description: `Resource "${resource.name}" deleted successfully`,
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
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  // tRPC update mutation
  const updateResource = api.resources.update.useMutation();

  // Handle inline field updates
  const handleInlineSave = async (resourceId: number, field: keyof GetResourceResponse, value: any) => {
    try {
      const updateData = {
        id: resourceId,
        [field]: value,
      };

      const result = await updateResource.mutateAsync(updateData);
      if (result.success) {
        toast({
          title: "Success",
          description: `Resource ${field} updated successfully`,
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
      console.error("Inline update error:", error);
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive",
      });
    }
  };

  // Define table columns with inline editing
  const columns: ResourceEditableColumn[] = [
    {
      header: "Name",
      accessorKey: "name" as keyof GetResourceResponse,
      editable: true,
      type: "text" as const,
      cell: (row: GetResourceResponse) => <span className="font-medium">{row.name}</span>,
      onSave: (rowId: string | number, field: keyof GetResourceResponse, value: string) =>
        handleInlineSave(Number(rowId), field, value),
    },
    {
      header: "Type",
      accessorKey: "type" as keyof GetResourceResponse,
      editable: true,
      type: "select" as const,
      options: [
        { value: "human", label: "Human" },
        { value: "material", label: "Material" },
        { value: "equipment", label: "Equipment" },
      ],
      cell: (row: GetResourceResponse) => {
        const typeColors = {
          human: "bg-blue-100 text-blue-800",
          material: "bg-green-100 text-green-800",
          equipment: "bg-orange-100 text-orange-800",
        };
        return (
          <Badge className={typeColors[row.type as keyof typeof typeColors]}>
            {row.type}
          </Badge>
        );
      },
      onSave: (rowId: string | number, field: keyof GetResourceResponse, value: string) =>
        handleInlineSave(Number(rowId), field, value),
    },
    {
      header: "Hourly Rate",
      accessorKey: "hourlyRate" as keyof GetResourceResponse,
      editable: true,
      type: "number" as const,
      cell: (row: GetResourceResponse) => (
        <span className="font-mono">${parseFloat(row.hourlyRate).toFixed(2)}</span>
      ),
      onSave: (rowId: string | number, field: keyof GetResourceResponse, value: number) =>
        handleInlineSave(Number(rowId), field, value),
    },
    {
      header: "Daily Hours",
      accessorKey: "dailyWorkHours" as keyof GetResourceResponse,
      editable: true,
      type: "number" as const,
      cell: (row: GetResourceResponse) => (
        <span className="font-mono">{parseFloat(row.dailyWorkHours)}h</span>
      ),
      onSave: (rowId: string | number, field: keyof GetResourceResponse, value: number) =>
        handleInlineSave(Number(rowId), field, value),
    },
    {
      header: "Currency",
      accessorKey: "currency" as keyof GetResourceResponse,
      editable: true,
      type: "select" as const,
      options: [
        { value: "USD", label: "USD - US Dollar" },
        { value: "EUR", label: "EUR - Euro" },
        { value: "GBP", label: "GBP - British Pound" },
        { value: "CAD", label: "CAD - Canadian Dollar" },
        { value: "AUD", label: "AUD - Australian Dollar" },
      ],
      cell: (row: GetResourceResponse) => (
        <Badge variant="outline">{row.currency}</Badge>
      ),
      onSave: (rowId: string | number, field: keyof GetResourceResponse, value: string) =>
        handleInlineSave(Number(rowId), field, value),
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof GetResourceResponse,
      cell: (row: GetResourceResponse) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt" as keyof GetResourceResponse,
      cell: (row: GetResourceResponse) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof GetResourceResponse,
      cell: (row: GetResourceResponse) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/resources/${row.id}/availability`)}
          className="h-8 px-3"
        >
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </Button>
      ),
    },
  ];

  const handleEdit = (resource: GetResourceResponse) => {
    setEditingResource(resource);
  };

  const handleFormSuccess = () => {
    setIsCreateFormOpen(false);
    setEditingResource(null);
    refetch();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resources</h2>
          <p className="text-muted-foreground">
            Manage your team members, materials, and equipment
          </p>
        </div>
        <ResourcePatternForm
          organizationId={organizationId}
          onSuccess={handleFormSuccess}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          }
        />
      </div>

      {/* Table */}
      <EditableTable
        data={resources}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onAdd={() => setIsCreateFormOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        pageSize={20}
        emptyMessage="No resources found. Click 'Add Resource' to create your first resource."
        rowId={(resource) => resource.id}
      />

      {/* Edit form modal */}
      {editingResource && (
        <ResourcePatternForm
          organizationId={organizationId}
          onSuccess={handleFormSuccess}
          mode="edit"
          resourceId={editingResource.id}
          initialData={{
            name: editingResource.name,
            type: editingResource.type,
            hourlyRate: parseFloat(editingResource.hourlyRate),
            dailyWorkHours: parseFloat(editingResource.dailyWorkHours),
            currency: editingResource.currency,
            userId: editingResource.userId || undefined,
          }}
          trigger={null} // Controlled mode
        />
      )}

      {/* Create form modal */}
      {isCreateFormOpen && (
        <ResourcePatternForm
          organizationId={organizationId}
          onSuccess={handleFormSuccess}
          trigger={null} // Controlled mode
        />
      )}
    </div>
  );
}

// Export a memoized version
export const MemoizedResourceTable = React.memo(ResourceTable);