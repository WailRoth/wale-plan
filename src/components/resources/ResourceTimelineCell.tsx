"use client";

import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { format } from "date-fns";
import type { ResourceTimelineResource, ResourceTimelineDay } from "~/lib/types/resourceTimeline";

interface ResourceTimelineCellProps {
  resource: ResourceTimelineResource;
  date: Date;
  dayData?: ResourceTimelineDay;
  isWeekend?: boolean;
}

export function ResourceTimelineCell({
  resource,
  date,
  dayData,
  isWeekend = false,
}: ResourceTimelineCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get cell styling based on availability
  const getCellStyle = () => {
    if (!dayData) {
      return "bg-gray-50 border-gray-200";
    }

    if (dayData.source === "exception") {
      // Exception overrides - purple
      return dayData.isWorkingDay
        ? "bg-purple-100 border-purple-300 hover:bg-purple-200"
        : "bg-gray-100 border-gray-300 hover:bg-gray-200";
    }

    if (dayData.isWorkingDay) {
      // Normal working day - blue
      return "bg-blue-100 border-blue-300 hover:bg-blue-200";
    } else {
      // Non-working day - gray
      return "bg-gray-100 border-gray-300 hover:bg-gray-200";
    }
  };

  // Get cell content
  const getCellContent = () => {
    if (!dayData) {
      return <span className="text-xs text-gray-400">-</span>;
    }

    if (dayData.hoursAvailable === 0) {
      return <span className="text-xs text-gray-400">0h</span>;
    }

    return (
      <div className="text-center">
        <div className="text-xs font-medium">
          {dayData.hoursAvailable}h
        </div>
        {isHovered && dayData.cost > 0 && (
          <div className="text-xs text-muted-foreground">
            ${dayData.cost.toFixed(0)}
          </div>
        )}
      </div>
    );
  };

  // Get tooltip content
  const getTooltipContent = () => {
    if (!dayData) {
      return (
        <div className="text-sm">
          <div className="font-medium">{resource.name}</div>
          <div className="text-muted-foreground">
            {format(date, "EEEE, MMM d, yyyy")}
          </div>
          <div className="text-gray-500">No availability data</div>
        </div>
      );
    }

    return (
      <div className="text-sm space-y-1">
        <div className="font-medium">{resource.name}</div>
        <div className="text-muted-foreground">
          {format(date, "EEEE, MMM d, yyyy")}
        </div>
        <div className="space-y-1">
          <div>
            <span className="font-medium">Hours: </span>
            {dayData.hoursAvailable}h
          </div>
          <div>
            <span className="font-medium">Rate: </span>
            {dayData.currency} {dayData.hourlyRate}/hr
          </div>
          <div>
            <span className="font-medium">Cost: </span>
            {dayData.currency} {dayData.cost.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Status: </span>
            <span
              className={`ml-1 px-2 py-1 rounded text-xs ${
                dayData.source === "exception"
                  ? "bg-purple-100 text-purple-800"
                  : dayData.isWorkingDay
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {dayData.source === "exception"
                ? "Exception"
                : dayData.isWorkingDay
                ? "Working"
                : "Non-working"}
            </span>
          </div>
          {dayData.notes && (
            <div>
              <span className="font-medium">Notes: </span>
              {dayData.notes}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              w-20 h-12 p-1 border-r flex items-center justify-center
              cursor-pointer transition-all duration-150
              ${getCellStyle()}
              ${isWeekend ? "bg-opacity-50" : ""}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {getCellContent()}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs"
        >
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}