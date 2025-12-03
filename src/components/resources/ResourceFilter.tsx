"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { X } from "lucide-react";
import type { ResourceTimelineFilters, ResourceTimelineResource } from "~/lib/types/resourceTimeline";

interface ResourceFilterProps {
  filters: ResourceTimelineFilters;
  onFiltersChange: (filters: ResourceTimelineFilters) => void;
  resources: ResourceTimelineResource[];
}

export function ResourceFilter({ filters, onFiltersChange, resources }: ResourceFilterProps) {
  // Get unique resource types from resources
  const resourceTypes = Array.from(
    new Set(resources.map(r => r.type).filter(Boolean))
  ).sort();

  // Handle filter updates
  const updateFilter = (key: keyof ResourceTimelineFilters, value: any) => {
    const newFilters = { ...filters };

    if (value === undefined || value === "" || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter Resources</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resource Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="resource-type" className="text-sm font-medium">
            Resource Type
          </Label>
          <Select
            value={filters.resourceType || ""}
            onValueChange={(value) => updateFilter("resourceType", value || undefined)}
          >
            <SelectTrigger id="resource-type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {resourceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="availability-status" className="text-sm font-medium">
            Availability Status
          </Label>
          <Select
            value={filters.availabilityStatus || ""}
            onValueChange={(value) =>
              updateFilter("availabilityStatus", value || undefined)
            }
          >
            <SelectTrigger id="availability-status">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All status</SelectItem>
              <SelectItem value="working">Working days only</SelectItem>
              <SelectItem value="non-working">Non-working days only</SelectItem>
              <SelectItem value="exception">Exception days only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Hours Filter */}
        <div className="space-y-2">
          <Label htmlFor="min-hours" className="text-sm font-medium">
            Minimum Hours
          </Label>
          <Input
            id="min-hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="0"
            value={filters.minHours || ""}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter("minHours", value ? parseFloat(value) : undefined);
            }}
          />
        </div>

        {/* Maximum Hours Filter */}
        <div className="space-y-2">
          <Label htmlFor="max-hours" className="text-sm font-medium">
            Maximum Hours
          </Label>
          <Input
            id="max-hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="24"
            value={filters.maxHours || ""}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter("maxHours", value ? parseFloat(value) : undefined);
            }}
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <div className="text-sm font-medium mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.resourceType && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                Type: {filters.resourceType}
                <button
                  onClick={() => updateFilter("resourceType", undefined)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.availabilityStatus && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                Status: {filters.availabilityStatus}
                <button
                  onClick={() => updateFilter("availabilityStatus", undefined)}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.minHours !== undefined && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs">
                Min: {filters.minHours}h
                <button
                  onClick={() => updateFilter("minHours", undefined)}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filters.maxHours !== undefined && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">
                Max: {filters.maxHours}h
                <button
                  onClick={() => updateFilter("maxHours", undefined)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Info */}
      <div className="text-xs text-muted-foreground">
        Filters are applied to the timeline view to show only resources that match the criteria.
        Resource type and availability status filters work independently.
      </div>
    </div>
  );
}