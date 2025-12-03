"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DayRowEditor } from "./DayRowEditor";
import { type DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";
import { type ResourceWorkScheduleResponse } from "~/lib/types/resourcePattern";

interface DailyAvailabilityTableProps {
  patterns: (DailyAvailabilityPattern | ResourceWorkScheduleResponse)[];
  currency: string;
  disabled?: boolean;
  onChange: (patterns: DailyAvailabilityPattern[]) => void;
}

export function DailyAvailabilityTable({
  patterns,
  currency,
  disabled = false,
  onChange
}: DailyAvailabilityTableProps) {
  // Convert all patterns to DailyAvailabilityPattern format for consistency
  const normalizedPatterns: DailyAvailabilityPattern[] = patterns.map(pattern => {
    if ("dayOfWeekName" in pattern) {
      // ResourceWorkScheduleResponse format
      return {
        dayOfWeek: pattern.dayOfWeekName as DailyAvailabilityPattern["dayOfWeek"],
        isActive: pattern.isActive,
        startTime: pattern.workStartTime || "09:00",
        endTime: pattern.workEndTime || "17:00",
        hourlyRate: pattern.hourlyRate ?? undefined,
      };
    }
    // Already DailyAvailabilityPattern format
    return pattern as DailyAvailabilityPattern;
  });

  // Ensure we have all 7 days
  const allDays: DailyAvailabilityPattern["dayOfWeek"][] = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  const completePatterns = allDays.map(day => {
    const existing = normalizedPatterns.find(p => p.dayOfWeek === day);
    if (existing) {
      return existing;
    }
    // Default pattern for missing days
    return {
      dayOfWeek: day,
      isActive: day !== "saturday" && day !== "sunday",
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: undefined,
    };
  });

  const handlePatternChange = (day: string, updatedPattern: DailyAvailabilityPattern) => {
    const newPatterns = completePatterns.map(p =>
      p.dayOfWeek === day ? updatedPattern : p
    );
    onChange(newPatterns);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Configuration journalière de disponibilité
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurez les heures de travail et les tarifs pour chaque jour de la semaine
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="flex items-center gap-4 p-3 border-b font-medium text-sm text-muted-foreground">
            <div className="w-24">Jour</div>
            <div className="w-20">Statut</div>
            <div className="flex-1">Heures de travail</div>
            <div className="min-w-32">Coût horaire</div>
            <div className="w-12">État</div>
          </div>

          {/* Day Rows */}
          {allDays.map((day) => {
            const pattern = completePatterns.find(p => p.dayOfWeek === day)!;
            return (
              <DayRowEditor
                key={day}
                day={day}
                dayName={day}
                pattern={pattern}
                currency={currency}
                disabled={disabled}
                onChange={(updatedPattern) => handlePatternChange(day, updatedPattern)}
              />
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Jours actifs:</span>
              <span className="font-medium">
                {completePatterns.filter(p => p.isActive).length} / 7 jours
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Devise:</span>
              <span className="font-medium">{currency}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}