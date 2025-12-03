"use client";

import React from "react";
import { Badge } from "~/components/ui/badge";
import { ResourceTimelineCell } from "./ResourceTimelineCell";
import { format } from "date-fns";
import type { ResourceTimelineResource, ResourceTimelineDay } from "~/lib/types/resourceTimeline";

interface ResourceTimelineRowProps {
  resource: ResourceTimelineResource;
  dateHeaders: Date[];
}

export function ResourceTimelineRow({ resource, dateHeaders }: ResourceTimelineRowProps) {
  // Create a map of dates to timeline data for quick lookup
  const timelineDataMap = new Map<string, ResourceTimelineDay>(
    resource.timelineData.map(day => [day.date, day])
  );

  // Get resource type color
  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "human":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "equipment":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "material":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate resource totals for this date range
  const resourceTotals = dateHeaders.reduce((acc, date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayData = timelineDataMap.get(dateStr);

    if (dayData) {
      acc.totalHours += dayData.hoursAvailable;
      acc.totalCost += dayData.cost;
      acc.workingDays += dayData.isWorkingDay ? 1 : 0;
    }

    return acc;
  }, { totalHours: 0, totalCost: 0, workingDays: 0 });

  return (
    <div className="hover:bg-muted/50 transition-colors">
      <div className="flex items-center min-w-max">
        {/* Resource Info Column */}
        <div className="w-48 p-4 border-r">
          <div className="space-y-2">
            <div className="font-medium text-sm truncate" title={resource.name}>
              {resource.name}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${getResourceTypeColor(resource.type)}`}
              >
                {resource.type}
              </Badge>
              {!resource.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {resource.currency} {resource.hourlyRate}/hr
            </div>
            {/* Resource totals for this range */}
            <div className="text-xs text-muted-foreground pt-1 border-t">
              <div>{resourceTotals.totalHours.toFixed(1)}h</div>
              <div>${resourceTotals.totalCost.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Timeline Cells */}
        <div className="flex">
          {dateHeaders.map((date, index) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayData = timelineDataMap.get(dateStr);

            return (
              <ResourceTimelineCell
                key={`${resource.id}-${dateStr}`}
                resource={resource}
                date={date}
                dayData={dayData}
                isWeekend={date.getDay() === 0 || date.getDay() === 6}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}