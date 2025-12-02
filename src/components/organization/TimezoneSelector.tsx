"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Clock } from "lucide-react";

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  label?: string;
  disabled?: boolean;
}

export function TimezoneSelector({
  value,
  onChange,
  label = "Timezone",
  disabled = false,
}: TimezoneSelectorProps) {
  const { data, isLoading, error } = api.organization.getAvailableTimezones.useQuery();

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <Clock className="h-4 w-4" />
          <span>Failed to load timezones</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="timezone-selector" className="text-sm font-medium">
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="timezone-selector">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select a timezone" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {data?.success && data.data.map((timezone) => (
            <SelectItem key={timezone} value={timezone}>
              <div className="flex items-center gap-2">
                <span>{timezone}</span>
                {timezone === "UTC" && (
                  <span className="text-xs text-muted-foreground">(Default)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <p className="text-xs text-muted-foreground">
          Current time in {value}: {currentTimeInTimezone(value)}
        </p>
      )}
    </div>
  );
}

// Helper function to show current time in timezone
function currentTimeInTimezone(timezone: string): string {
  try {
    return new Date().toLocaleString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return 'Invalid timezone';
  }
}