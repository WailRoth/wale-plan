"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface ResourceTimelineHeaderProps {
  currentDate: Date;
  startDate?: string;
  endDate?: string;
  zoomLevel: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  isLoading?: boolean;
}

export function ResourceTimelineHeader({
  currentDate,
  startDate,
  endDate,
  zoomLevel,
  onPrevious,
  onNext,
  onToday,
  isLoading = false,
}: ResourceTimelineHeaderProps) {
  // Calculate date range display
  const getDateRangeDisplay = () => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start) + 1;

    if (days === 1) {
      return format(start, "MMM d, yyyy");
    }

    // If same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, "MMM d")}-${format(end, "d, yyyy")}`;
    }

    // Different months
    return `${format(start, "MMM d")}-${format(end, "MMM d, yyyy")}`;
  };

  const getZoomLabel = () => {
    switch (zoomLevel) {
      case "week":
        return "Week";
      case "2weeks":
        return "2 Weeks";
      case "month":
        return "Month";
      default:
        return "Custom";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            disabled={isLoading}
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Date Range Display */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <>
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {getDateRangeDisplay()}
              </span>
              <Badge variant="secondary" className="text-xs">
                {getZoomLabel()}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Additional Controls (placeholder for future features) */}
      <div className="flex items-center gap-2">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}