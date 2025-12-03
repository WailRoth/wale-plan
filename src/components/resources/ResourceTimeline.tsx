"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import { toast } from "~/components/ui/toast/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Users,
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { ResourceTimelineHeader } from "./ResourceTimelineHeader";
import { ResourceTimelineRow } from "./ResourceTimelineRow";
import { ResourceFilter } from "./ResourceFilter";
import { ResourceTimelineCell } from "./ResourceTimelineCell";
import { ResourceTimelineErrorBoundary } from "./ResourceTimelineErrorBoundary";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import type {
  ResourceTimelineData,
  ResourceTimelineResource,
  ResourceTimelineDay,
  ResourceTimelineFilters
} from "~/lib/types/resourceTimeline";

interface ResourceTimelineProps {
  organizationId: number;
  className?: string;
}

const ZOOM_LEVELS = [
  { value: "week", label: "Week", days: 7 },
  { value: "2weeks", label: "2 Weeks", days: 14 },
  { value: "month", label: "Month", days: 30 },
] as const;

type ZoomLevel = typeof ZOOM_LEVELS[number]["value"];

export function ResourceTimeline({ organizationId, className }: ResourceTimelineProps) {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("week");
  const [filters, setFilters] = useState<ResourceTimelineFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Calculate date range based on zoom level
  const { startDate, endDate } = useMemo(() => {
    const days = ZOOM_LEVELS.find(z => z.value === zoomLevel)?.days || 7;
    let start = currentDate;

    // Align to week start for week and 2weeks views
    if (zoomLevel === "week" || zoomLevel === "2weeks") {
      start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    }

    const end = addDays(start, days - 1);

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, [currentDate, zoomLevel]);

  // tRPC query for timeline data
  const {
    data: timelineResponse,
    isLoading,
    error,
    refetch,
  } = api.resourceTimeline.getTimeline.useQuery(
    {
      startDate,
      endDate,
      organizationId,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    },
    {
      enabled: !!organizationId && !!startDate && !!endDate,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const timelineData = (timelineResponse as any)?.data?.data;

  // Filter resources based on filters - optimized with granular dependencies
  const filteredResources = useMemo(() => {
    if (!timelineData?.resources) return [];

    return timelineData.resources.filter((resource: ResourceTimelineResource) => {
      // Resource type filter
      if (filters.resourceType && resource.type !== filters.resourceType) {
        return false;
      }

      // Check if resource has any matching timeline data
      const hasMatchingData = resource.timelineData.some(day => {
        // Availability status filter
        if (filters.availabilityStatus) {
          switch (filters.availabilityStatus) {
            case "working":
              return day.isWorkingDay;
            case "non-working":
              return !day.isWorkingDay;
            case "exception":
              return day.source === "exception";
          }
        }

        // Hours range filter
        if (filters.minHours !== undefined && day.hoursAvailable < filters.minHours) {
          return false;
        }
        if (filters.maxHours !== undefined && day.hoursAvailable > filters.maxHours) {
          return false;
        }

        return true;
      });

      return hasMatchingData;
    });
  }, [timelineData?.resources, filters.resourceType, filters.availabilityStatus, filters.minHours, filters.maxHours]); // Granular dependency tracking

  // Navigation functions
  const navigatePrevious = useCallback(() => {
    const days = ZOOM_LEVELS.find(z => z.value === zoomLevel)?.days || 7;
    setCurrentDate(prev => subDays(prev, days));
  }, [zoomLevel]);

  const navigateNext = useCallback(() => {
    const days = ZOOM_LEVELS.find(z => z.value === zoomLevel)?.days || 7;
    setCurrentDate(prev => addDays(prev, days));
  }, [zoomLevel]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Generate date headers
  const dateHeaders = useMemo(() => {
    if (!timelineData?.dateRange) return [];

    const dates = [];
    const start = new Date(timelineData.dateRange.startDate);
    const end = new Date(timelineData.dateRange.endDate);

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      dates.push(new Date(current));
    }

    return dates;
  }, [timelineData?.dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredResources.length) return { totalHours: 0, totalCost: 0, workingDays: 0 };

    return filteredResources.reduce((acc: { totalHours: number; totalCost: number; workingDays: number }, resource: ResourceTimelineResource) => {
      return resource.timelineData.reduce((dayAcc: { totalHours: number; totalCost: number; workingDays: number }, day: ResourceTimelineDay) => {
        return {
          totalHours: dayAcc.totalHours + day.hoursAvailable,
          totalCost: dayAcc.totalCost + day.cost,
          workingDays: dayAcc.workingDays + (day.isWorkingDay ? 1 : 0),
        };
      }, acc);
    }, { totalHours: 0, totalCost: 0, workingDays: 0 });
  }, [filteredResources]);

  // Set up virtualizer
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredResources.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated height of each row
    overscan: 5, // Number of items to render outside viewport
  });

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Timeline</h3>
          <p className="text-muted-foreground text-center mb-4">
            {error.message || "An error occurred while loading the resource timeline"}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header Controls */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle>Resource Timeline</CardTitle>
                <CardDescription>
                  Visualize resource availability across all resources
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filters Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>

              {/* Zoom Level */}
              <Select value={zoomLevel} onValueChange={(value: ZoomLevel) => setZoomLevel(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZOOM_LEVELS.map(zoom => (
                    <SelectItem key={zoom.value} value={zoom.value}>
                      {zoom.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceFilter
              filters={filters}
              onFiltersChange={setFilters}
              resources={timelineData?.resources || []}
            />
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <ResourceTimelineErrorBoundary>
        <Card>
          <CardHeader>
          {/* Navigation Header */}
          <ResourceTimelineHeader
            currentDate={currentDate}
            startDate={timelineData?.dateRange?.startDate}
            endDate={timelineData?.dateRange?.endDate}
            zoomLevel={zoomLevel}
            onPrevious={navigatePrevious}
            onNext={navigateNext}
            onToday={navigateToday}
            isLoading={isLoading}
          />
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="flex space-x-2 flex-1">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-20" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {Object.keys(filters).length > 0
                  ? "No resources match the current filters. Try adjusting your filter criteria."
                  : "No resources available for the selected time period."
                }
              </p>
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Timeline Header */}
              <div className="border-b bg-muted/50 sticky top-0 z-10">
                <div className="flex items-center min-w-max">
                  <div className="w-48 p-4 border-r font-medium text-sm">
                    Resource
                  </div>
                  {dateHeaders.map((date, index) => (
                    <div
                      key={index}
                      className="w-20 p-2 border-r text-center"
                    >
                      <div className="text-xs font-medium">
                        {format(date, "EEE")}
                      </div>
                      <div className="text-sm">
                        {format(date, "d")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Timeline Rows */}
              <div
                ref={parentRef}
                style={{
                  height: '400px',
                  overflow: 'auto',
                }}
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                    const resource = filteredResources[virtualItem.index];
                    return (
                      <div
                        key={virtualItem.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <ResourceTimelineRow
                          resource={resource}
                          dateHeaders={dateHeaders}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Footer */}
              <div className="border-t bg-muted/50">
                <div className="flex items-center min-w-max">
                  <div className="w-48 p-4 border-r font-medium text-sm">
                    Totals
                  </div>
                  <div className="flex-1 grid grid-cols-7 gap-2 p-2">
                    <div className="col-span-7 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {totals.totalHours.toFixed(1)} hours
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${totals.totalCost.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {filteredResources.length} resources
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </ResourceTimelineErrorBoundary>
    </div>
  );
}