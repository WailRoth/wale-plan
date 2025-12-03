"use client";

import React from "react";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";
import type { ResourceWorkScheduleResponse } from "~/lib/types/resourcePattern";

interface DayRowEditorProps {
  day: string;
  dayName: string;
  pattern: DailyAvailabilityPattern | ResourceWorkScheduleResponse;
  currency: string;
  disabled?: boolean;
  onChange: (pattern: DailyAvailabilityPattern) => void;
}

// Day names in French as per the story requirements
const FRENCH_DAY_NAMES: Record<string, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export function DayRowEditor({
  day,
  dayName,
  pattern,
  currency,
  disabled = false,
  onChange
}: DayRowEditorProps) {
  const [startTime, setStartTime] = React.useState(
    "startTime" in pattern ? pattern.startTime :
    "workStartTime" in pattern ? pattern.workStartTime || "09:00" : "09:00"
  );
  const [endTime, setEndTime] = React.useState(
    "endTime" in pattern ? pattern.endTime :
    "workEndTime" in pattern ? pattern.workEndTime || "17:00" : "17:00"
  );
  const [hourlyRate, setHourlyRate] = React.useState(
    ("hourlyRate" in pattern && typeof pattern.hourlyRate === "number") ? pattern.hourlyRate.toString() :
    ("hourlyRate" in pattern && typeof pattern.hourlyRate === "string") ? pattern.hourlyRate : ""
  );
  const [isActive, setIsActive] = React.useState(
    pattern.isActive || false
  );

  // Helper to handle time input validation
  const handleTimeChange = (value: string, isStart: boolean) => {
    // Basic time validation (HH:MM format)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (value && !timeRegex.test(value)) {
      return; // Invalid format, don't update
    }

    if (isStart) {
      setStartTime(value);
    } else {
      setEndTime(value);
    }

    // Update pattern if valid
    if (value && timeRegex.test(value)) {
      const newPattern = {
        dayOfWeek: day as DailyAvailabilityPattern["dayOfWeek"],
        isActive,
        startTime: isStart ? value : startTime,
        endTime: isStart ? endTime : value,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      };
      onChange(newPattern);
    }
  };

  // Handle activation toggle
  const handleActiveChange = (checked: boolean) => {
    setIsActive(checked);
    const newPattern = {
      dayOfWeek: day as DailyAvailabilityPattern["dayOfWeek"],
      isActive: checked,
      startTime: startTime,
      endTime: endTime,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
    };
    onChange(newPattern);
  };

  // Handle hourly rate change
  const handleHourlyRateChange = (value: string) => {
    const numValue = parseFloat(value);
    if (value === "" || (!isNaN(numValue) && numValue >= 0)) {
      setHourlyRate(value);
      const newPattern = {
        dayOfWeek: day as DailyAvailabilityPattern["dayOfWeek"],
        isActive,
        startTime,
        endTime,
        hourlyRate: value ? parseFloat(value) : undefined,
      };
      onChange(newPattern);
    }
  };

  const displayDayName = FRENCH_DAY_NAMES[day] || dayName;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border transition-colors",
        isActive ? "bg-background border-border" : "bg-muted/30 border-muted",
        !isActive && disabled && "opacity-50"
      )}
    >
      {/* Day Name */}
      <div className="w-24 font-medium">
        {displayDayName}
      </div>

      {/* Active Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`active-${day}`}
          checked={isActive}
          onCheckedChange={handleActiveChange}
          disabled={disabled}
        />
        <Label htmlFor={`active-${day}`} className="text-sm">
          Actif
        </Label>
      </div>

      {/* Working Hours */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => handleTimeChange(e.target.value, true)}
            disabled={!isActive || disabled}
            className="w-24 h-8 text-sm"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => handleTimeChange(e.target.value, false)}
            disabled={!isActive || disabled}
            className="w-24 h-8 text-sm"
          />
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="flex items-center gap-2 min-w-32">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency}
          </span>
          <Input
            type="number"
            value={hourlyRate}
            onChange={(e) => handleHourlyRateChange(e.target.value)}
            disabled={!isActive || disabled}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-28 h-8 text-sm pl-6"
          />
        </div>
        <Badge variant="outline" className="text-xs">
          {currency}
        </Badge>
      </div>

      {/* Status Indicator */}
      <div className="w-12">
        {isActive ? (
          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Inactif
          </Badge>
        )}
      </div>
    </div>
  );
}